// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildLayoutSetupMarkup } from "../buildLayoutSetupMarkup";

describe("buildLayoutSetupMarkup", () => {
  it("shows cordon stake total and context line for a multi-lane layout", () => {
    const markup = buildLayoutSetupMarkup({
      laneCount: 3,
      laneLengthMetres: 280,
      cordonStakeSpacingMetres: 5,
      batchMarkerCardsNeeded: 8,
    });

    expect(markup).toContain("Cordon stakes needed: 228");
    expect(markup).toContain(
      "3 lanes × 280 m, 4 cordon lines, stakes every 5 m (both ends staked)",
    );
    expect(markup).toContain("Batch marker cards needed: 8");
  });

  it("uses singular lane and cordon line copy for a single-lane layout", () => {
    const markup = buildLayoutSetupMarkup({
      laneCount: 1,
      laneLengthMetres: 30,
      cordonStakeSpacingMetres: 5,
    });

    expect(markup).toContain("Cordon stakes needed: 14");
    expect(markup).toContain(
      "1 lane × 30 m, 2 cordon lines, stakes every 5 m (both ends staked)",
    );
    expect(markup).not.toContain("Batch marker cards needed");
  });

  it("uses singular batch marker card copy when only one is needed", () => {
    const markup = buildLayoutSetupMarkup({
      laneCount: 2,
      laneLengthMetres: 200,
      cordonStakeSpacingMetres: 5,
      batchMarkerCardsNeeded: 1,
    });

    expect(markup).toContain("Batch marker cards needed: 1");
  });
});
