import type { FinishTokensSettings } from "./types";

export const DEFAULT_FINISH_TOKENS_SETTINGS: FinishTokensSettings = {
  tokensPerMinutePerVolunteer: 15,
  volunteerCount: 1,
  tokenSupplyBatchSize: 100,
  tokenSupplyFetchDelaySeconds: 30,
};

export const DEFAULT_FINISHER_SPACING_METRES = 0.75;
export const DEFAULT_DECELERATION_ZONE_METRES = 5;
export const DEFAULT_CORDON_STAKE_SPACING_METRES = 5;
export const FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH = 2;
export const DEFAULT_FIXTURE_ID = "mernda-400";
