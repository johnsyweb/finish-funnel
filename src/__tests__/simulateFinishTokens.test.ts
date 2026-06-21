import { describe, expect, it } from "vitest";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";
import { laneQueueCapacity } from "../multiLaneFunnel";
import { simulateFinishTokens } from "../simulateFinishTokens";

const twoFinisherLaneLengthMetres =
  DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

describe("simulateFinishTokens", () => {
  it("does not cap admissions when lane layout is omitted", () => {
    const result = simulateFinishTokens({
      arrivals: [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 0.5, position: 2 },
        { timeSeconds: 1, position: 3 },
      ],
    });

    expect(result.finishLineBackupModelled).toBe(false);
    expect(result.peakQueueDepth).toBe(3);
  });

  it("caps peak queue depth at combined lane capacity when layout is configured", () => {
    const perLaneCapacity = laneQueueCapacity({
      laneLengthMetres: twoFinisherLaneLengthMetres,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    const result = simulateFinishTokens({
      arrivals: [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 0.5, position: 2 },
        { timeSeconds: 1, position: 3 },
        { timeSeconds: 1.5, position: 4 },
        { timeSeconds: 2, position: 5 },
      ],
      laneCount: 2,
      laneLengthMetres: twoFinisherLaneLengthMetres,
    });

    expect(result.finishLineBackupModelled).toBe(true);
    expect(result.peakQueueDepth).toBe(perLaneCapacity * 2);
    expect(result.effectiveArrivals[4]).toMatchObject({
      position: 5,
      timeSeconds: 4,
    });
  });

  it("completes when finisher spacing exceeds lane queue length so capacity is zero", () => {
    const result = simulateFinishTokens({
      arrivals: [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 1, position: 2 },
      ],
      laneCount: 1,
      laneLengthMetres: 30,
      finisherSpacingMetres: 26,
    });

    expect(result.finishLineBackupModelled).toBe(false);
    expect(result.peakQueueDepth).toBe(2);
  });
});
