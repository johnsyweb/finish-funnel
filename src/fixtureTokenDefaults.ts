import type { FinishTokensSettings } from "./types";

const FIXTURE_TOKEN_DEFAULTS: Record<
  string,
  Pick<FinishTokensSettings, "tokenSupplyBatchSize">
> = {
  "mernda-400": { tokenSupplyBatchSize: 100 },
  "bushy-1095": { tokenSupplyBatchSize: 30 },
  "albert-melbourne-693": { tokenSupplyBatchSize: 30 },
};

export function fixtureTokenDefaults(
  fixtureId: string,
): Pick<FinishTokensSettings, "tokenSupplyBatchSize"> {
  return (
    FIXTURE_TOKEN_DEFAULTS[fixtureId] ?? {
      tokenSupplyBatchSize: 100,
    }
  );
}
