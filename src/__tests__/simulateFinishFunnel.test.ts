import { describe, expect, it } from "vitest";
import { simulateFinishFunnel } from "../simulateFinishFunnel";
import { DEFAULT_FINISH_TOKENS_SETTINGS } from "../defaults";

describe("simulateFinishFunnel", () => {
  it("records peak queue depth of 1 when one finisher arrives before a token is handed out", () => {
    const result = simulateFinishFunnel(
      [{ timeSeconds: 0 }],
      DEFAULT_FINISH_TOKENS_SETTINGS,
    );

    expect(result.peakQueueDepth).toBe(1);
  });

  it("records peak queue depth of 2 when two finishers arrive before the first token is handed out", () => {
    const result = simulateFinishFunnel(
      [{ timeSeconds: 0 }, { timeSeconds: 0.5 }],
      DEFAULT_FINISH_TOKENS_SETTINGS,
    );

    expect(result.peakQueueDepth).toBe(2);
  });

  it("reports funnel not required when peak queue depth is at most 2", () => {
    const withinThreshold = simulateFinishFunnel(
      [{ timeSeconds: 0 }, { timeSeconds: 1 }],
      DEFAULT_FINISH_TOKENS_SETTINGS,
    );
    const aboveThreshold = simulateFinishFunnel(
      [{ timeSeconds: 0 }, { timeSeconds: 0.5 }, { timeSeconds: 1 }],
      DEFAULT_FINISH_TOKENS_SETTINGS,
    );

    expect(withinThreshold.funnelNotRequired).toBe(true);
    expect(aboveThreshold.funnelNotRequired).toBe(false);
  });

  it("records token handover times in queue order at discrete token intervals", () => {
    const result = simulateFinishFunnel(
      [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 0.5, position: 2 },
      ],
      DEFAULT_FINISH_TOKENS_SETTINGS,
    );

    expect(result.finisherSchedules).toEqual([
      {
        position: 1,
        arrivalTimeSeconds: 0,
        tokenHandoverTimeSeconds: 4,
      },
      {
        position: 2,
        arrivalTimeSeconds: 0.5,
        tokenHandoverTimeSeconds: 8,
      },
    ]);
    expect(result.effectiveArrivals).toEqual([
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 0.5, position: 2 },
    ]);
  });

  it("caps peak queue depth and delays admission when maxQueueDepth is reached", () => {
    const result = simulateFinishFunnel(
      [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 0.5, position: 2 },
        { timeSeconds: 1, position: 3 },
      ],
      DEFAULT_FINISH_TOKENS_SETTINGS,
      { maxQueueDepth: 2 },
    );

    expect(result.peakQueueDepth).toBe(2);
    expect(result.effectiveArrivals).toEqual([
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 0.5, position: 2 },
      { timeSeconds: 4, position: 3 },
    ]);
    expect(result.finisherSchedules).toEqual([
      {
        position: 1,
        arrivalTimeSeconds: 0,
        tokenHandoverTimeSeconds: 4,
      },
      {
        position: 2,
        arrivalTimeSeconds: 0.5,
        tokenHandoverTimeSeconds: 8,
      },
      {
        position: 3,
        arrivalTimeSeconds: 4,
        tokenHandoverTimeSeconds: 12,
      },
    ]);
  });

  it("does not loop forever when maxQueueDepth is zero", () => {
    const result = simulateFinishFunnel(
      [
        { timeSeconds: 0, position: 1 },
        { timeSeconds: 1, position: 2 },
      ],
      DEFAULT_FINISH_TOKENS_SETTINGS,
      { maxQueueDepth: 0 },
    );

    expect(result.peakQueueDepth).toBe(2);
  });
});
