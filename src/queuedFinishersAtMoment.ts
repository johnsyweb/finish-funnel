import {
  buildFinisherArrivals,
  type EventFinisherInput,
} from "./analyzeFinishFunnel";
import { DEFAULT_FINISH_TOKENS_SETTINGS } from "./defaults";
import { formatFinishClockTime } from "./formatFinishClockTime";
import { simulateFinishFunnel } from "./simulateFinishFunnel";
import type { FinishTokensSettings } from "./types";

const DEFAULT_PAGE_LIMIT = 25;

export type QueuedFinisherAtMoment = {
  position: number;
  name: string;
  publishedFinishTime: string;
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
};

export type QueuedFinishersAtMomentResult = {
  selectedMomentSeconds: number;
  queueDepth: number;
  totalCount: number;
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

export function queuedFinishersAtMoment(
  input: QueuedFinishersAtMomentInput,
): QueuedFinishersAtMomentResult {
  const finishTokensSettings =
    input.finishTokensSettings ?? DEFAULT_FINISH_TOKENS_SETTINGS;
  const offset = input.offset ?? 0;
  const limit = input.limit ?? DEFAULT_PAGE_LIMIT;
  const finisherByPosition = new Map(
    input.finishers.map((finisher) => [finisher.position, finisher]),
  );

  const simulation = simulateFinishFunnel(
    buildFinisherArrivals(input.finishers),
    finishTokensSettings,
  );

  const queuedAtMoment = simulation.finisherSchedules
    .filter((schedule) => isQueuedAtMoment(schedule, input.momentSeconds))
    .sort((left, right) => left.arrivalTimeSeconds - right.arrivalTimeSeconds);

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

      return {
        position: finisher.position,
        name: finisher.name,
        publishedFinishTime: finisher.time,
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
