import { describe, expect, it } from "vitest";
import {
  clampFinisherSpacingMetres,
  finisherSpacingMetresFromInput,
  maximumFinisherSpacingMetres,
} from "../finisherSpacingLimits";

describe("maximumFinisherSpacingMetres", () => {
  it("equals lane length minus deceleration zone", () => {
    expect(
      maximumFinisherSpacingMetres({
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(25);
  });
});

describe("clampFinisherSpacingMetres", () => {
  it("clamps spacing above the lane queue zone to the maximum", () => {
    expect(
      clampFinisherSpacingMetres({
        finisherSpacingMetres: 26,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(25);
  });

  it("clamps spacing below the minimum to 0.25 m", () => {
    expect(
      clampFinisherSpacingMetres({
        finisherSpacingMetres: 0.1,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(0.25);
  });

  it("leaves valid spacing unchanged", () => {
    expect(
      clampFinisherSpacingMetres({
        finisherSpacingMetres: 0.75,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(0.75);
  });
});

describe("finisherSpacingMetresFromInput", () => {
  it("uses fallback when the input is empty or non-numeric", () => {
    expect(
      finisherSpacingMetresFromInput({
        rawValue: "",
        fallback: 0.75,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(0.75);
  });

  it("clamps numeric input above the lane queue zone", () => {
    expect(
      finisherSpacingMetresFromInput({
        rawValue: "26",
        fallback: 0.75,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
      }),
    ).toBe(25);
  });
});
