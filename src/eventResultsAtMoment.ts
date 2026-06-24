import {
  buildFinisherArrivals,
  type EventFinisherInput,
} from "./analyzeFinishFunnel";
import {
  assignFinisherLanes,
  type FinisherLaneAssignment,
} from "./assignFinisherLanes";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { formatFinishClockTime } from "./formatFinishClockTime";
import { formatFinishTokensVolunteerLabel } from "./formatFinishTokensVolunteerLabel";
import {
  finishLineBlockedCountAtMoment,
  queueMomentSummaryFromAssignments,
  type QueueMomentSummary,
} from "./queueMomentSummary";
import { simulateFinishTokens } from "./simulateFinishTokens";
import type {
  FinisherArrival,
  FinisherSchedule,
  FinishTokensSettings,
} from "./types";

export type EventResultFinisherState =
  | "not-yet-finished"
  | "finish-line-blocked"
  | "queued"
  | "tokened";

export type EventResultAtMoment = {
  position: number;
  name: string;
  publishedFinishTime: string;
  estimated: boolean;
  state: EventResultFinisherState;
  status: string;
  lane: string;
  physicalBatch?: string;
  isBatchMarkerHolder?: boolean;
  queuePosition: string;
  timeWaiting: string;
  timeUntilToken: string;
  totalEstimatedQueueingTime: string;
  finishTokensVolunteer: string;
};

export type EventResultsAtMomentInput = {
  finishers: EventFinisherInput[];
  finishTokensSettings?: FinishTokensSettings;
  momentSeconds: number;
  nameFilter?: string;
  finishPositionFilter?: number;
  laneCount?: number;
  laneLengthMetres?: number;
  decelerationZoneMetres?: number;
  finisherSpacingMetres?: number;
};

export type EventResultsAtMomentResult = {
  selectedMomentSeconds: number;
  queueDepth: number;
  totalCount: number;
  visibleCount: number;
  queueMomentSummary: QueueMomentSummary;
  finishers: EventResultAtMoment[];
};

function formatQueueDuration(durationSeconds: number): string {
  return formatFinishClockTime(Math.max(0, durationSeconds));
}

export function firstMomentAtPeakQueueDepth(
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>,
  peakQueueDepth: number,
): number {
  if (queueDepthOverTime.length === 0) {
    return 0;
  }

  const firstExactPeak = queueDepthOverTime.find(
    (point) => point.queueDepth === peakQueueDepth,
  );
  if (firstExactPeak) {
    return firstExactPeak.timeSeconds;
  }

  const peakInTimeline = Math.max(
    ...queueDepthOverTime.map((point) => point.queueDepth),
  );
  const firstTimelinePeak = queueDepthOverTime.find(
    (point) => point.queueDepth === peakInTimeline,
  );

  return firstTimelinePeak?.timeSeconds ?? queueDepthOverTime[0].timeSeconds;
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

function finisherStateAtMoment({
  publishedArrivalSeconds,
  effectiveArrivalSeconds,
  tokenHandoverSeconds,
  momentSeconds,
  finishLineBackupModelled,
}: {
  publishedArrivalSeconds: number;
  effectiveArrivalSeconds: number;
  tokenHandoverSeconds: number;
  momentSeconds: number;
  finishLineBackupModelled: boolean;
}): EventResultFinisherState {
  if (publishedArrivalSeconds > momentSeconds) {
    return "not-yet-finished";
  }

  if (finishLineBackupModelled && effectiveArrivalSeconds > momentSeconds) {
    return "finish-line-blocked";
  }

  if (tokenHandoverSeconds > momentSeconds) {
    return "queued";
  }

  return "tokened";
}

function statusForState(state: EventResultFinisherState): string {
  if (state === "finish-line-blocked") {
    return "At finish line";
  }

  if (state === "queued") {
    return "In queue";
  }

  return "";
}

export function eventResultsAtMoment(
  input: EventResultsAtMomentInput,
): EventResultsAtMomentResult {
  const finishTokensSettings =
    input.finishTokensSettings ?? DEFAULT_FINISH_TOKENS_SETTINGS;
  const decelerationZoneMetres =
    input.decelerationZoneMetres ?? DEFAULT_DECELERATION_ZONE_METRES;
  const finisherSpacingMetres =
    input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES;
  const laneCount = input.laneCount ?? 1;
  const laneLengthMetres = input.laneLengthMetres ?? 30;

  const publishedArrivals = buildFinisherArrivals(input.finishers);
  const publishedByPosition = new Map(
    publishedArrivals.map((arrival) => [arrival.position ?? -1, arrival]),
  );
  const simulation = simulateFinishTokens({
    arrivals: publishedArrivals,
    finishTokensSettings,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const effectiveByPosition = new Map(
    simulation.effectiveArrivals.map((arrival) => [
      arrival.position ?? -1,
      arrival,
    ]),
  );
  const scheduleByPosition = new Map(
    simulation.finisherSchedules.map((schedule) => [
      schedule.position ?? -1,
      schedule,
    ]),
  );
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
  const queuePositionByPosition = new Map<number, number>(
    queuedAtMoment.map((schedule, index) => [
      schedule.position ?? -1,
      index + 1,
    ]),
  );

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

  const rows = [...input.finishers]
    .sort((left, right) => left.position - right.position)
    .map((finisher) =>
      buildEventResultRow({
        finisher,
        momentSeconds: input.momentSeconds,
        laneCount,
        finishLineBackupModelled: simulation.finishLineBackupModelled,
        publishedByPosition,
        effectiveByPosition,
        scheduleByPosition,
        laneByPosition,
        queuePositionByPosition,
      }),
    );

  let visibleRows = rows;

  if (input.nameFilter) {
    const needle = input.nameFilter.toLowerCase();
    visibleRows = visibleRows.filter((row) =>
      row.name.toLowerCase().includes(needle),
    );
  }

  if (input.finishPositionFilter !== undefined) {
    visibleRows = visibleRows.filter(
      (row) => row.position === input.finishPositionFilter,
    );
  }

  return {
    selectedMomentSeconds: input.momentSeconds,
    queueDepth: queuedAtMoment.length,
    totalCount: rows.length,
    visibleCount: visibleRows.length,
    queueMomentSummary,
    finishers: visibleRows,
  };
}

function buildEventResultRow({
  finisher,
  momentSeconds,
  laneCount,
  finishLineBackupModelled,
  publishedByPosition,
  effectiveByPosition,
  scheduleByPosition,
  laneByPosition,
  queuePositionByPosition,
}: {
  finisher: EventFinisherInput;
  momentSeconds: number;
  laneCount: number;
  finishLineBackupModelled: boolean;
  publishedByPosition: Map<number, FinisherArrival>;
  effectiveByPosition: Map<number, FinisherArrival>;
  scheduleByPosition: Map<number, FinisherSchedule>;
  laneByPosition: Map<number | undefined, FinisherLaneAssignment>;
  queuePositionByPosition: Map<number, number>;
}): EventResultAtMoment {
  const publishedArrival = publishedByPosition.get(finisher.position);
  const effectiveArrival = effectiveByPosition.get(finisher.position);
  const schedule = scheduleByPosition.get(finisher.position);
  const estimated =
    finisher.time.trim().toLowerCase() === "unknown" ||
    schedule?.estimated === true;

  if (!publishedArrival || !effectiveArrival || !schedule) {
    throw new Error(
      `Simulation schedule not found for position ${finisher.position}`,
    );
  }

  const state = finisherStateAtMoment({
    publishedArrivalSeconds: publishedArrival.timeSeconds,
    effectiveArrivalSeconds: effectiveArrival.timeSeconds,
    tokenHandoverSeconds: schedule.tokenHandoverTimeSeconds,
    momentSeconds,
    finishLineBackupModelled,
  });
  const laneAssignment = laneByPosition.get(finisher.position);

  if (state === "not-yet-finished") {
    return emptyEventResultRow(finisher, estimated);
  }

  if (state === "finish-line-blocked") {
    return {
      position: finisher.position,
      name: finisher.name,
      publishedFinishTime: finisher.time,
      estimated,
      state,
      status: statusForState(state),
      lane: "",
      queuePosition: "",
      timeWaiting: "",
      timeUntilToken: "",
      totalEstimatedQueueingTime: "",
      finishTokensVolunteer: "",
    };
  }

  const lane = formatLaneLabel(laneAssignment?.lane ?? "overflow");
  const physicalBatch = formatPhysicalBatchLabel(
    laneAssignment?.physicalBatch,
    laneCount,
  );
  const totalEstimatedQueueingTime = formatQueueDuration(
    schedule.tokenHandoverTimeSeconds - schedule.arrivalTimeSeconds,
  );

  if (state === "queued") {
    return {
      position: finisher.position,
      name: finisher.name,
      publishedFinishTime: finisher.time,
      estimated,
      state,
      status: statusForState(state),
      lane,
      physicalBatch,
      isBatchMarkerHolder: laneAssignment?.isBatchMarkerHolder,
      queuePosition: String(
        queuePositionByPosition.get(finisher.position) ?? "",
      ),
      timeWaiting: formatQueueDuration(
        momentSeconds - schedule.arrivalTimeSeconds,
      ),
      timeUntilToken: formatQueueDuration(
        schedule.tokenHandoverTimeSeconds - momentSeconds,
      ),
      totalEstimatedQueueingTime,
      finishTokensVolunteer: "",
    };
  }

  return {
    position: finisher.position,
    name: finisher.name,
    publishedFinishTime: finisher.time,
    estimated,
    state,
    status: "",
    lane,
    physicalBatch,
    isBatchMarkerHolder: laneAssignment?.isBatchMarkerHolder,
    queuePosition: "",
    timeWaiting: totalEstimatedQueueingTime,
    timeUntilToken: "",
    totalEstimatedQueueingTime,
    finishTokensVolunteer:
      schedule.finishTokensVolunteerNumber === undefined
        ? ""
        : formatFinishTokensVolunteerLabel(
            schedule.finishTokensVolunteerNumber,
          ),
  };
}

function emptyEventResultRow(
  finisher: EventFinisherInput,
  estimated: boolean,
): EventResultAtMoment {
  return {
    position: finisher.position,
    name: finisher.name,
    publishedFinishTime: finisher.time,
    estimated,
    state: "not-yet-finished",
    status: "",
    lane: "",
    queuePosition: "",
    timeWaiting: "",
    timeUntilToken: "",
    totalEstimatedQueueingTime: "",
    finishTokensVolunteer: "",
  };
}
