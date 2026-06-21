import { describe, expect, it } from "vitest";
import { buildMetricsMarkup } from "../buildMetricsMarkup";

const recommendedLayout = {
  laneCount: 3,
  laneLengthMetres: 266,
  sufficient: true,
  combinedLaneCapacity: 1044,
  headroomFinishers: 2,
  shortfallFinishers: 0,
};

const proposedLayout = {
  sufficient: false,
  combinedLaneCapacity: 786,
  headroomFinishers: 0,
  shortfallFinishers: 256,
  minimumLanesRequired: 3,
};

describe("buildMetricsMarkup", () => {
  it("shows peak queue capacity and recommended layout", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      recommendedFunnelLayout: recommendedLayout,
      proposedMultiLaneLayout: {
        ...recommendedLayout,
        minimumLanesRequired: 3,
      },
      proposedMatchesRecommendation: true,
    });

    expect(markup).toContain("Peak queue capacity");
    expect(markup).toContain("1042");
    expect(markup).toContain("Recommended layout");
    expect(markup).toContain("3 lanes × 266 m");
    expect(markup).toContain("Sufficient (2 finisher headroom)");
    expect(markup).not.toContain("Proposed layout");
  });

  it("shows proposed adequacy only when proposed differs from recommendation", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      recommendedFunnelLayout: recommendedLayout,
      proposedMultiLaneLayout: proposedLayout,
      proposedMatchesRecommendation: false,
    });

    expect(markup).toContain("Short by 256 finishers");
    expect(markup).toContain("Proposed layout");
  });

  it("shows finish-line backup delay metrics when finishers were blocked", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      recommendedFunnelLayout: {
        ...recommendedLayout,
        sufficient: false,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 256,
      },
      proposedMultiLaneLayout: proposedLayout,
      proposedMatchesRecommendation: false,
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

  it("shows token supply gap metrics when handover paused for batch fetches", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 12,
      recommendedFunnelLayout: {
        laneCount: 2,
        laneLengthMetres: 200,
        sufficient: true,
        combinedLaneCapacity: 520,
        headroomFinishers: 508,
        shortfallFinishers: 0,
      },
      proposedMultiLaneLayout: {
        sufficient: true,
        combinedLaneCapacity: 520,
        headroomFinishers: 508,
        shortfallFinishers: 0,
        minimumLanesRequired: 1,
      },
      proposedMatchesRecommendation: true,
      tokenSupplyGaps: {
        gapCount: 4,
        totalPauseSeconds: 120,
      },
    });

    expect(markup).toContain("Token supply gaps");
    expect(markup).toContain("2:00");
    expect(markup).toContain("4 gaps");
  });
});
