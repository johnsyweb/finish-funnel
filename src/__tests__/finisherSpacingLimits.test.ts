import { describe, expect, it } from "vitest";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";
import {
  clampFinisherSpacingMetres,
  finisherSpacingMetresFromInput,
  maximumFinisherSpacingMetres,
  shouldImmediatelySyncFinisherSpacing,
  syncFinisherSpacingInputValue,
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

  it("never returns zero for invalid input", () => {
    expect(
      finisherSpacingMetresFromInput({
        rawValue: "0",
        fallback: DEFAULT_FINISHER_SPACING_METRES,
        laneLengthMetres: 30,
        decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      }),
    ).toBeGreaterThan(0);
  });
});

describe("syncFinisherSpacingInputValue", () => {
  it("writes zero back to the clamped minimum when the lane queue zone is empty", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "0.75",
      laneLengthMetres: DEFAULT_DECELERATION_ZONE_METRES,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(synced.value).toBe("0.25");
    expect(synced.max).toBe("0.25");
    expect(synced.metres).toBe(0.25);
  });

  it("writes zero back to the effective spacing when the user clears the field to zero", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "0",
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(synced.value).toBe("0.75");
    expect(synced.metres).toBe(0.75);
  });

  it("clamps spacing above the lane queue zone", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "26",
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(synced.value).toBe("25");
    expect(synced.max).toBe("25");
    expect(synced.metres).toBe(25);
  });

  it("leaves valid spacing unchanged", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "0.75",
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(synced.value).toBe("0.75");
    expect(synced.metres).toBe(0.75);
  });
});

describe("shouldImmediatelySyncFinisherSpacing", () => {
  it("allows a decimal prefix while the user is typing", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "0.75",
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(shouldImmediatelySyncFinisherSpacing("0.", synced)).toBe(false);
    expect(shouldImmediatelySyncFinisherSpacing("0.7", synced)).toBe(false);
  });

  it("syncs bare zero and values above the lane queue zone", () => {
    const synced = syncFinisherSpacingInputValue({
      rawValue: "0.75",
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    });

    expect(shouldImmediatelySyncFinisherSpacing("0", synced)).toBe(true);
    expect(shouldImmediatelySyncFinisherSpacing("26", synced)).toBe(true);
  });
});
