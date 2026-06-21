import {
  buildFinisherArrivals,
  type EventFinisherInput,
} from "./analyzeFinishFunnel";
import { assignFinisherLanes } from "./assignFinisherLanes";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { formatFinishClockTime } from "./formatFinishClockTime";
import {
  finishLineBlockedCountAtMoment,
  queueMomentSummaryFromAssignments,
  type QueueMomentSummary,
} from "./queueMomentSummary";
import { simulateFinishTokens } from "./simulateFinishTokens";
import type { FinishTokensSettings } from "./types";

const DEFAULT_PAGE_LIMIT = 25;

export type QueuedFinisherAtMoment = {
  position: number;
  name: string;
  publishedFinishTime: string;
  lane: string;
  physicalBatch?: string;
  isBatchMarkerHolder?: boolean;
  queuePosition: number;
  timeWaiting: string;
  timeUntilToken: string;
  totalEstimatedQueueingTime: string;
  estimated: boolean;
};

export type QueuedFinishersAtMomentInput = {
  finishers: EventFinisherInput[];
  finishTokensSettings?: FinishTokensSettings;
  momentSeconds: number;
  offset?: number;
  limit?: number;
  nameFilter?: string;
  finishPositionFilter?: number;
  laneCount?: number;
  laneLengthMetres?: number;
  decelerationZoneMetres?: number;
  finisherSpacingMetres?: number;
};

export type QueuedFinishersAtMomentResult = {
  selectedMomentSeconds: number;
  queueDepth: number;
  totalCount: number;
  queueMomentSummary: QueueMomentSummary;
  finishers: QueuedFinisherAtMoment[];
};

function formatQueueDuration(durationSeconds: number): string {
  return formatFinishClockTime(Math.max(0, durationSeconds));
}

export function firstMomentAtPeakQueueDepth(
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>,
  peakQueueDepth: number,
): number {
  const firstPeak = queueDepthOverTime.find(
    (point) => point.queueDepth === peakQueueDepth,
  );

  if (!firstPeak) {
    throw new Error("Peak queue depth not found in simulation timeline");
  }

  return firstPeak.timeSeconds;
}

function isQueuedAtMoment(
  schedule: { arrivalTimeSeconds: number; tokenHandoverTimeSeconds: number },
  momentSeconds: number,
): boolean {
  return (
    schedule.arrivalTimeSeconds <= momentSeconds &&
    schedule.tokenHandoverTimeSeconds > momentSeconds
  );
}

function formatLaneLabel(lane: number | "overflow"): string {
  return lane === "overflow" ? "Overflow" : String(lane);
}

function formatPhysicalBatchLabel(
  physicalBatch: string | undefined,
  laneCount: number,
): string | undefined {
  if (physicalBatch === undefined || laneCount <= 1) {
    return undefined;
  }

  return physicalBatch === "unnamed" ? "unnamed" : physicalBatch;
}

export function queuedFinishersAtMoment(
  input: QueuedFinishersAtMomentInput,
): QueuedFinishersAtMomentResult {
  const finishTokensSettings =
    input.finishTokensSettings ?? DEFAULT_FINISH_TOKENS_SETTINGS;
  const decelerationZoneMetres =
    input.decelerationZoneMetres ?? DEFAULT_DECELERATION_ZONE_METRES;
  const finisherSpacingMetres =
    input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES;
  const laneCount = input.laneCount ?? 1;
  const laneLengthMetres = input.laneLengthMetres ?? 30;
  const offset = input.offset ?? 0;
  const limit = input.limit ?? DEFAULT_PAGE_LIMIT;
  const finisherByPosition = new Map(
    input.finishers.map((finisher) => [finisher.position, finisher]),
  );

  const publishedArrivals = buildFinisherArrivals(input.finishers);
  const simulation = simulateFinishTokens({
    arrivals: publishedArrivals,
    finishTokensSettings,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const laneAssignments = assignFinisherLanes({
    arrivals: simulation.effectiveArrivals,
    finisherSchedules: simulation.finisherSchedules,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const laneByPosition = new Map(
    laneAssignments.map((assignment) => [assignment.position, assignment]),
  );

  const queuedAtMoment = simulation.finisherSchedules
    .filter((schedule) => isQueuedAtMoment(schedule, input.momentSeconds))
    .sort((left, right) => left.arrivalTimeSeconds - right.arrivalTimeSeconds);

  const finishLineBlockedCount = simulation.finishLineBackupModelled
    ? finishLineBlockedCountAtMoment({
        publishedArrivals,
        effectiveArrivals: simulation.effectiveArrivals,
        momentSeconds: input.momentSeconds,
      })
    : undefined;

  const queueMomentSummary = queueMomentSummaryFromAssignments({
    queuedPositions: queuedAtMoment
      .map((schedule) => schedule.position)
      .filter((position): position is number => position !== undefined),
    laneAssignments,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
    finishLineBlockedCount,
  });

  let filtered = queuedAtMoment;

  if (input.nameFilter) {
    const needle = input.nameFilter.toLowerCase();
    filtered = filtered.filter((schedule) => {
      const finisher = finisherByPosition.get(schedule.position ?? -1);
      return finisher?.name.toLowerCase().includes(needle) ?? false;
    });
  }

  if (input.finishPositionFilter !== undefined) {
    filtered = filtered.filter(
      (schedule) => schedule.position === input.finishPositionFilter,
    );
  }

  const page = filtered.slice(offset, offset + limit);

  return {
    selectedMomentSeconds: input.momentSeconds,
    queueDepth: queuedAtMoment.length,
    totalCount: filtered.length,
    queueMomentSummary,
    finishers: page.map((schedule, index) => {
      const finisher = finisherByPosition.get(schedule.position ?? -1);
      if (!finisher) {
        throw new Error(`Finisher not found for position ${schedule.position}`);
      }

      const timeWaiting = input.momentSeconds - schedule.arrivalTimeSeconds;
      const timeUntilToken =
        schedule.tokenHandoverTimeSeconds - input.momentSeconds;
      const totalEstimatedQueueingTime =
        schedule.tokenHandoverTimeSeconds - schedule.arrivalTimeSeconds;
      const laneAssignment = laneByPosition.get(finisher.position);

      return {
        position: finisher.position,
        name: finisher.name,
        publishedFinishTime: finisher.time,
        lane: formatLaneLabel(laneAssignment?.lane ?? "overflow"),
        physicalBatch: formatPhysicalBatchLabel(
          laneAssignment?.physicalBatch,
          laneCount,
        ),
        isBatchMarkerHolder: laneAssignment?.isBatchMarkerHolder,
        queuePosition: offset + index + 1,
        timeWaiting: formatQueueDuration(timeWaiting),
        timeUntilToken: formatQueueDuration(timeUntilToken),
        totalEstimatedQueueingTime: formatQueueDuration(
          totalEstimatedQueueingTime,
        ),
        estimated:
          schedule.estimated === true ||
          finisher.time.trim().toLowerCase() === "unknown",
      };
    }),
  };
}
