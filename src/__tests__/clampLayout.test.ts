import { describe, expect, it } from "vitest";
import {
  clampLayoutToSiteConstraints,
  layoutMatchesModelRecommendation,
} from "../clampLayout";

describe("clampLayoutToSiteConstraints", () => {
  it("limits lane count and lane length to site maximums", () => {
    expect(
      clampLayoutToSiteConstraints({
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
});

describe("layoutMatchesModelRecommendation", () => {
  it("returns true when layout matches the model recommendation", () => {
    expect(
      layoutMatchesModelRecommendation(
        { laneCount: 2, laneLengthMetres: 200 },
        { laneCount: 2, laneLengthMetres: 200 },
      ),
    ).toBe(true);
  });

  it("returns false when either value differs", () => {
    expect(
      layoutMatchesModelRecommendation(
        { laneCount: 1, laneLengthMetres: 200 },
        { laneCount: 2, laneLengthMetres: 200 },
      ),
    ).toBe(false);
  });
});
