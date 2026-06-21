import type { TokenSupplyGapEvent } from "./finishTokensRotation";

export type TokenSupplyGapSummary = {
  gapCount: number;
  totalPauseSeconds: number;
};

export function tokenSupplyGapSummary(
  gaps: TokenSupplyGapEvent[],
): TokenSupplyGapSummary | undefined {
  if (gaps.length === 0) {
    return undefined;
  }

  const totalPauseSeconds = gaps.reduce(
    (total, gap) => total + (gap.endSeconds - gap.startSeconds),
    0,
  );

  return {
    gapCount: gaps.length,
    totalPauseSeconds,
  };
}
