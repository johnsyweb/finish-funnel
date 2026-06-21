import { describe, expect, it } from "vitest";
import {
  clampProposedFunnelToSiteConstraints,
  proposedFunnelMatchesRecommendation,
} from "../clampProposedFunnel";

describe("clampProposedFunnelToSiteConstraints", () => {
  it("limits lane count and lane length to site maximums", () => {
    expect(
      clampProposedFunnelToSiteConstraints({
        laneCount: 5,
        laneLengthMetres: 400,
        maximumLaneCount: 2,
        maximumLaneLengthMetres: 300,
      }),
    ).toEqual({
      laneCount: 2,
      laneLengthMetres: 300,
    });
  });

  it("enforces a minimum of one lane", () => {
    expect(
      clampProposedFunnelToSiteConstraints({
        laneCount: 0,
        laneLengthMetres: -5,
        maximumLaneCount: 2,
        maximumLaneLengthMetres: 300,
      }),
    ).toEqual({
      laneCount: 1,
      laneLengthMetres: 0,
    });
  });
});

describe("proposedFunnelMatchesRecommendation", () => {
  it("returns true when proposed and recommended layouts match", () => {
    expect(
      proposedFunnelMatchesRecommendation(
        { laneCount: 2, laneLengthMetres: 200 },
        { laneCount: 2, laneLengthMetres: 200 },
      ),
    ).toBe(true);
  });

  it("returns false when either value differs", () => {
    expect(
      proposedFunnelMatchesRecommendation(
        { laneCount: 1, laneLengthMetres: 200 },
        { laneCount: 2, laneLengthMetres: 200 },
      ),
    ).toBe(false);
  });
});
