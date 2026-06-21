import { describe, expect, it } from "vitest";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";
import {
  minimumLaneLengthMetres,
  recommendFunnelLayout,
} from "../recommendFunnelLayout";

describe("minimumLaneLengthMetres", () => {
  it("returns the shortest whole-metre lane length that holds the lane share of peak queue depth", () => {
    expect(
      minimumLaneLengthMetres({
        laneCount: 3,
        peakQueueDepth: 1042,
        maximumLaneLengthMetres: 300,
        decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
        finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
      }),
    ).toBe(266);
  });
});

describe("recommendFunnelLayout", () => {
  it("recommends the fewest lanes and shortest per-lane length within site constraints", () => {
    const result = recommendFunnelLayout({
      peakQueueDepth: 1042,
      maximumLaneLengthMetres: 300,
      maximumLaneCount: 3,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      laneCount: 3,
      laneLengthMetres: 266,
      sufficient: true,
      combinedLaneCapacity: 1044,
      headroomFinishers: 2,
    });
  });

  it("does not use the full maximum lane length when less rope suffices", () => {
    const result = recommendFunnelLayout({
      peakQueueDepth: 10,
      maximumLaneLengthMetres: 300,
      maximumLaneCount: 3,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      laneCount: 1,
      laneLengthMetres: 13,
      sufficient: true,
    });
    expect(result.laneLengthMetres).toBeLessThan(300);
  });

  it("still recommends one lane at the shortest length when funnel not required", () => {
    const result = recommendFunnelLayout({
      peakQueueDepth: 2,
      maximumLaneLengthMetres: 300,
      maximumLaneCount: 3,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      laneCount: 1,
      laneLengthMetres: 7,
      sufficient: true,
    });
  });

  it("uses site maxima and reports shortfall when peak queue depth cannot be held", () => {
    const result = recommendFunnelLayout({
      peakQueueDepth: 1042,
      maximumLaneLengthMetres: 30,
      maximumLaneCount: 2,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      laneCount: 2,
      laneLengthMetres: 30,
      sufficient: false,
      combinedLaneCapacity: 66,
      shortfallFinishers: 976,
    });
  });
});
