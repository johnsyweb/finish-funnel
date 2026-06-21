import { describe, expect, it } from "vitest";
import { tokenSupplyGapSummary } from "../tokenSupplyGapSummary";

describe("tokenSupplyGapSummary", () => {
  it("returns undefined when no gaps occurred", () => {
    expect(tokenSupplyGapSummary([])).toBeUndefined();
  });

  it("sums gap count and total pause time", () => {
    expect(
      tokenSupplyGapSummary([
        { startSeconds: 8, endSeconds: 38 },
        { startSeconds: 100, endSeconds: 130 },
      ]),
    ).toEqual({
      gapCount: 2,
      totalPauseSeconds: 60,
    });
  });
});
