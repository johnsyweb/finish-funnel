import { DEFAULT_FINISH_TOKENS_SETTINGS } from "./defaults";
import { finishTokensSettingsFromVolunteers } from "./finishTokensSettingsFromVolunteers";
import type { ParsedVolunteer } from "./parseVolunteersHtml";
import type { PersistedEventSettings } from "./persistedEventSettings";
import type { FinishTokensSettings } from "./types";

export function finishTokensSettingsForEvent({
  persisted,
  volunteers,
}: {
  persisted: PersistedEventSettings;
  volunteers: ParsedVolunteer[];
}): FinishTokensSettings {
  const rosterSettings = finishTokensSettingsFromVolunteers(volunteers, {
    tokensPerMinutePerVolunteer: persisted.tokensPerMinutePerVolunteer,
    volunteerCount: DEFAULT_FINISH_TOKENS_SETTINGS.volunteerCount,
    tokenSupplyBatchSize: persisted.tokenSupplyBatchSize,
    tokenSupplyFetchDelaySeconds: persisted.tokenSupplyFetchDelaySeconds,
  });

  return {
    tokensPerMinutePerVolunteer: persisted.tokensPerMinutePerVolunteer,
    tokenSupplyBatchSize: persisted.tokenSupplyBatchSize,
    volunteerCount: rosterSettings.volunteerCount,
    tokenSupplyFetchDelaySeconds: rosterSettings.tokenSupplyFetchDelaySeconds,
  };
}
