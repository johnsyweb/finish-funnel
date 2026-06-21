import { describe, expect, it } from "vitest";
import { buildMetricsMarkup } from "../buildMetricsMarkup";

describe("buildMetricsMarkup", () => {
  it("shows minimum lanes required instead of single-lane recommended metres", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      proposedMultiLaneLayout: {
        sufficient: false,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 256,
        minimumLanesRequired: 3,
      },
    });

    expect(markup).toContain("Peak queue capacity");
    expect(markup).toContain("1042");
    expect(markup).toContain("Minimum lanes required");
    expect(markup).toContain("3");
    expect(markup).not.toContain("Recommended funnel length");
  });

  it("shows combined lane capacity and adequacy shortfall", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      proposedMultiLaneLayout: {
        sufficient: false,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 256,
        minimumLanesRequired: 3,
      },
    });

    expect(markup).toContain("Combined lane capacity");
    expect(markup).toContain("786");
    expect(markup).toContain("Short by 256 finishers");
  });

  it("shows finish-line backup delay metrics when finishers were blocked", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 786,
      proposedMultiLaneLayout: {
        sufficient: true,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 0,
        minimumLanesRequired: 2,
      },
      finishLineBackupDelays: {
        maxDelaySeconds: 120,
        averageDelaySeconds: 45,
        delayedFinisherCount: 256,
      },
    });

    expect(markup).toContain("Finish-line backup delay");
    expect(markup).toContain("2:00");
    expect(markup).toContain("0:45");
    expect(markup).toContain("256 finishers");
  });
});
