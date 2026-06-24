import {
  DEFAULT_CORDON_STAKE_SPACING_METRES,
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";

export type PersistedEventSettings = {
  maximumLaneLengthMetres: number;
  maximumLaneCount: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
  cordonStakeSpacingMetres: number;
  tokensPerMinutePerVolunteer: number;
  tokenSupplyBatchSize: number;
  tokenSupplyFetchDelaySeconds: number;
};

export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

export const DEFAULT_PERSISTED_EVENT_SETTINGS: PersistedEventSettings = {
  maximumLaneLengthMetres: 30,
  maximumLaneCount: 1,
  decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
  finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
  cordonStakeSpacingMetres: DEFAULT_CORDON_STAKE_SPACING_METRES,
  tokensPerMinutePerVolunteer:
    DEFAULT_FINISH_TOKENS_SETTINGS.tokensPerMinutePerVolunteer,
  tokenSupplyBatchSize: DEFAULT_FINISH_TOKENS_SETTINGS.tokenSupplyBatchSize,
  tokenSupplyFetchDelaySeconds:
    DEFAULT_FINISH_TOKENS_SETTINGS.tokenSupplyFetchDelaySeconds,
};

export function loadPersistedEventSettings(
  storage: SettingsStorage,
  storageKey: string,
): PersistedEventSettings {
  const raw = storage.getItem(storageKey);
  if (!raw) {
    return { ...DEFAULT_PERSISTED_EVENT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedEventSettings>;
    return {
      ...DEFAULT_PERSISTED_EVENT_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_PERSISTED_EVENT_SETTINGS };
  }
}

export function savePersistedEventSettings(
  storage: SettingsStorage,
  storageKey: string,
  settings: PersistedEventSettings,
): void {
  storage.setItem(storageKey, JSON.stringify(settings));
}
