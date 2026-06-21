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
});
