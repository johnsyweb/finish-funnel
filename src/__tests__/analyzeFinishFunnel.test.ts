import { describe, expect, it } from "vitest";
import { analyzeFinishFunnel } from "../analyzeFinishFunnel";

describe("analyzeFinishFunnel", () => {
  it("recommends a rounded physical length for a busy burst of finishers", () => {
    const result = analyzeFinishFunnel({
      finishers: [
        { position: 1, time: "23:00" },
        { position: 2, time: "23:00" },
        { position: 3, time: "23:00" },
        { position: 4, time: "23:01" },
      ],
    });

    expect(result.peakQueueDepth).toBeGreaterThan(2);
    expect(result.recommendedLengthMetres).toBeGreaterThan(5);
    expect(result.funnelNotRequired).toBe(false);
  });

  it("reports a quiet event may not need a roped-off funnel", () => {
    const result = analyzeFinishFunnel({
      finishers: [
        { position: 1, time: "18:30" },
        { position: 2, time: "19:45" },
      ],
    });

    expect(result.funnelNotRequired).toBe(true);
    expect(result.recommendedLengthMetres).toBe(6);
  });
});
