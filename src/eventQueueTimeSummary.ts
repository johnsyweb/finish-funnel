import type { FinisherSchedule } from "./types";

export type EventQueueTimeSummary = {
  maxSeconds: number;
  meanSeconds: number;
  medianSeconds: number;
  finisherCount: number;
};

export function queueingTimeSecondsFromSchedule(
  schedule: FinisherSchedule,
): number {
  return Math.max(
    0,
    schedule.tokenHandoverTimeSeconds - schedule.arrivalTimeSeconds,
  );
}

function medianSeconds(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middleIndex] ?? 0;
  }

  const lowerMiddle = sorted[middleIndex - 1] ?? 0;
  const upperMiddle = sorted[middleIndex] ?? 0;

  return (lowerMiddle + upperMiddle) / 2;
}

export function eventQueueTimeSummary(
  finisherSchedules: FinisherSchedule[],
): EventQueueTimeSummary {
  const queueingTimesSeconds = finisherSchedules.map(
    queueingTimeSecondsFromSchedule,
  );

  if (queueingTimesSeconds.length === 0) {
    return {
      maxSeconds: 0,
      meanSeconds: 0,
      medianSeconds: 0,
      finisherCount: 0,
    };
  }

  const totalSeconds = queueingTimesSeconds.reduce(
    (sum, queueingTimeSeconds) => sum + queueingTimeSeconds,
    0,
  );

  return {
    maxSeconds: Math.max(...queueingTimesSeconds),
    meanSeconds: totalSeconds / queueingTimesSeconds.length,
    medianSeconds: medianSeconds(queueingTimesSeconds),
    finisherCount: queueingTimesSeconds.length,
  };
}
