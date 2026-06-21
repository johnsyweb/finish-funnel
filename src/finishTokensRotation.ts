export type VolunteerPoolState = {
  volunteers: Array<{
    tokensRemaining: number;
    batchReadyAt: number;
  }>;
  activeIndex: number;
};

export type TokenSupplyGapEvent = {
  startSeconds: number;
  endSeconds: number;
};

export function createInitialVolunteerPool(
  volunteerCount: number,
  batchSize: number,
): VolunteerPoolState {
  return {
    activeIndex: 0,
    volunteers: Array.from({ length: volunteerCount }, () => ({
      tokensRemaining: batchSize,
      batchReadyAt: 0,
    })),
  };
}

function syncVolunteerBatch(
  volunteer: VolunteerPoolState["volunteers"][number],
  timeSeconds: number,
  batchSize: number,
): void {
  if (
    volunteer.tokensRemaining === 0 &&
    volunteer.batchReadyAt <= timeSeconds
  ) {
    volunteer.tokensRemaining = batchSize;
  }
}

export function advanceAfterTokenHandover({
  pool,
  timeSeconds,
  batchSize,
  fetchDelaySeconds,
  secondsPerToken,
}: {
  pool: VolunteerPoolState;
  timeSeconds: number;
  batchSize: number;
  fetchDelaySeconds: number;
  secondsPerToken: number;
}): {
  nextHandoverTimeSeconds: number;
  gap?: TokenSupplyGapEvent;
} {
  const activeVolunteer = pool.volunteers[pool.activeIndex]!;
  activeVolunteer.tokensRemaining -= 1;

  if (activeVolunteer.tokensRemaining > 0) {
    return { nextHandoverTimeSeconds: timeSeconds + secondsPerToken };
  }

  const departingIndex = pool.activeIndex;
  pool.volunteers[departingIndex]!.batchReadyAt =
    timeSeconds + fetchDelaySeconds;
  pool.volunteers[departingIndex]!.tokensRemaining = 0;

  for (let offset = 1; offset <= pool.volunteers.length; offset += 1) {
    const candidateIndex = (departingIndex + offset) % pool.volunteers.length;
    const candidate = pool.volunteers[candidateIndex]!;
    syncVolunteerBatch(candidate, timeSeconds, batchSize);

    if (candidate.tokensRemaining > 0) {
      pool.activeIndex = candidateIndex;
      return { nextHandoverTimeSeconds: timeSeconds + secondsPerToken };
    }
  }

  const gapEndSeconds = Math.min(
    ...pool.volunteers
      .filter((volunteer) => volunteer.batchReadyAt > timeSeconds)
      .map((volunteer) => volunteer.batchReadyAt),
  );

  for (let offset = 1; offset <= pool.volunteers.length; offset += 1) {
    const candidateIndex = (departingIndex + offset) % pool.volunteers.length;
    const candidate = pool.volunteers[candidateIndex]!;
    syncVolunteerBatch(candidate, gapEndSeconds, batchSize);

    if (candidate.tokensRemaining > 0) {
      pool.activeIndex = candidateIndex;
      break;
    }
  }

  return {
    nextHandoverTimeSeconds: gapEndSeconds + secondsPerToken,
    gap: { startSeconds: timeSeconds, endSeconds: gapEndSeconds },
  };
}
