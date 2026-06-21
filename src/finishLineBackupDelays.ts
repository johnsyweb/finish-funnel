import type { FinisherArrival } from "./types";

export type FinishLineBackupDelaySummary = {
  maxDelaySeconds: number;
  averageDelaySeconds: number;
  delayedFinisherCount: number;
};

export function finishLineBackupDelaySummary({
  publishedArrivals,
  effectiveArrivals,
}: {
  publishedArrivals: FinisherArrival[];
  effectiveArrivals: FinisherArrival[];
}): FinishLineBackupDelaySummary | undefined {
  const publishedByPosition = new Map(
    publishedArrivals.map((arrival) => [arrival.position ?? -1, arrival]),
  );
  const delaysSeconds: number[] = [];

  for (const effectiveArrival of effectiveArrivals) {
    const publishedArrival = publishedByPosition.get(
      effectiveArrival.position ?? -1,
    );
    if (!publishedArrival) {
      continue;
    }

    const delaySeconds =
      effectiveArrival.timeSeconds - publishedArrival.timeSeconds;
    if (delaySeconds > 0) {
      delaysSeconds.push(delaySeconds);
    }
  }

  if (delaysSeconds.length === 0) {
    return undefined;
  }

  const totalDelaySeconds = delaysSeconds.reduce(
    (sum, delaySeconds) => sum + delaySeconds,
    0,
  );

  return {
    maxDelaySeconds: Math.max(...delaysSeconds),
    averageDelaySeconds: totalDelaySeconds / delaysSeconds.length,
    delayedFinisherCount: delaysSeconds.length,
  };
}
