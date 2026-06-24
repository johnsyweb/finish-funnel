import type { PersistedEventSettings } from "./persistedEventSettings";

export function simulationSettingsStateKey({
  persisted,
  finisherSpacingRaw,
}: {
  persisted: PersistedEventSettings;
  finisherSpacingRaw: string;
}): string {
  return JSON.stringify({
    tokensPerMinutePerVolunteer: persisted.tokensPerMinutePerVolunteer,
    tokenSupplyBatchSize: persisted.tokenSupplyBatchSize,
    tokenSupplyFetchDelaySeconds: persisted.tokenSupplyFetchDelaySeconds,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
    maximumLaneCount: persisted.maximumLaneCount,
    finisherSpacingRaw,
  });
}
