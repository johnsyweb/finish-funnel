import { DEFAULT_FINISH_TOKENS_SETTINGS } from "./defaults";
import {
  finishTokensVolunteerCount,
  hasFinishTokenSupport,
  type ParsedVolunteer,
} from "./parseVolunteersHtml";
import type { FinishTokensSettings } from "./types";

export function finishTokensSettingsFromVolunteers(
  volunteers: ParsedVolunteer[],
  defaults: FinishTokensSettings = DEFAULT_FINISH_TOKENS_SETTINGS,
): FinishTokensSettings {
  const rosterCount = finishTokensVolunteerCount(volunteers);

  return {
    ...defaults,
    volunteerCount: rosterCount > 0 ? rosterCount : defaults.volunteerCount,
    tokenSupplyFetchDelaySeconds: hasFinishTokenSupport(volunteers)
      ? 0
      : defaults.tokenSupplyFetchDelaySeconds,
  };
}
