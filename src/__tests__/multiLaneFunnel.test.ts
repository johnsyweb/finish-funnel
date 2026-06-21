import { describe, expect, it } from "vitest";
import {
  checkProposedMultiLaneLayout,
  combinedLaneCapacity,
  laneQueueCapacity,
  minimumLanesRequired,
} from "../multiLaneFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";

describe("laneQueueCapacity", () => {
  it("derives finishers held in one lane from physical length minus deceleration", () => {
    expect(
      laneQueueCapacity({
        laneLengthMetres: 300,
        decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
        finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
      }),
    ).toBe(393);
  });
});

describe("combinedLaneCapacity", () => {
  it("sums lane queue capacity across all lanes", () => {
    expect(
      combinedLaneCapacity({
        laneCount: 2,
        laneLengthMetres: 300,
        decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
        finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
      }),
    ).toBe(786);
  });
});

describe("minimumLanesRequired", () => {
  it("rounds up peak queue depth divided by lane queue capacity", () => {
    expect(
      minimumLanesRequired({
        peakQueueDepth: 1042,
        laneLengthMetres: 300,
        decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
        finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
      }),
    ).toBe(3);
  });
});

describe("checkProposedMultiLaneLayout", () => {
  it("reports shortfall for Bushy 2 × 300 m against peak queue depth 1042", () => {
    const result = checkProposedMultiLaneLayout({
      laneCount: 2,
      laneLengthMetres: 300,
      peakQueueDepth: 1042,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      sufficient: false,
      combinedLaneCapacity: 786,
      shortfallFinishers: 256,
      minimumLanesRequired: 3,
    });
  });

  it("matches single-lane checkProposedFunnel when lane count is 1", () => {
    const result = checkProposedMultiLaneLayout({
      laneCount: 1,
      laneLengthMetres: 30,
      peakQueueDepth: 10,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      sufficient: true,
      combinedLaneCapacity: 33,
      headroomFinishers: 23,
    });
  });
});
