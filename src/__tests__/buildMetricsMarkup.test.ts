import { describe, expect, it } from "vitest";
import { buildMetricsMarkup } from "../buildMetricsMarkup";

const modelRecommendation = {
  laneCount: 3,
  laneLengthMetres: 266,
  sufficient: true,
  combinedLaneCapacity: 1044,
  headroomFinishers: 2,
  shortfallFinishers: 0,
};

const layoutCheck = {
  sufficient: true,
  combinedLaneCapacity: 1044,
  headroomFinishers: 2,
  shortfallFinishers: 0,
  minimumLanesRequired: 3,
};

describe("buildMetricsMarkup", () => {
  it("shows a single layout row when layout matches the model recommendation", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      layout: { laneCount: 3, laneLengthMetres: 266, ...layoutCheck },
      modelRecommendation,
      layoutMatchesModelRecommendation: true,
    });

    expect(markup).toContain("Peak queue capacity");
    expect(markup).toContain("1042");
    expect(markup).toContain("Layout");
    expect(markup).toContain("3 lanes × 266 m");
    expect(markup).toContain("Sufficient (2 finisher headroom)");
    expect(markup).not.toContain("Model recommendation");
  });

  it("shows model recommendation when layout has been tweaked", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      layout: {
        laneCount: 2,
        laneLengthMetres: 300,
        sufficient: false,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 256,
      },
      modelRecommendation,
      layoutMatchesModelRecommendation: false,
    });

    expect(markup).toContain("Layout");
    expect(markup).toContain("2 lanes × 300 m");
    expect(markup).toContain("Short by 256 finishers");
    expect(markup).toContain("Model recommendation");
    expect(markup).toContain("3 lanes × 266 m");
    expect(markup).toContain("Sufficient (2 finisher headroom)");
  });

  it("shows finish-line backup delay metrics when finishers were blocked", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 1042,
      layout: {
        laneCount: 2,
        laneLengthMetres: 300,
        sufficient: false,
        combinedLaneCapacity: 786,
        headroomFinishers: 0,
        shortfallFinishers: 256,
      },
      modelRecommendation,
      layoutMatchesModelRecommendation: false,
      finishLineBackupDelays: {
        maxDelaySeconds: 120,
        averageDelaySeconds: 45,
        delayedFinisherCount: 256,
      },
    });

    expect(markup).toContain("Finish-line backup delay");
    expect(markup).toContain("2:00");
  });

  it("shows token supply gap metrics when handover paused for batch fetches", () => {
    const markup = buildMetricsMarkup({
      peakQueueDepth: 12,
      layout: {
        laneCount: 2,
        laneLengthMetres: 200,
        sufficient: true,
        combinedLaneCapacity: 520,
        headroomFinishers: 508,
        shortfallFinishers: 0,
      },
      modelRecommendation: {
        laneCount: 2,
        laneLengthMetres: 200,
        sufficient: true,
        combinedLaneCapacity: 520,
        headroomFinishers: 508,
        shortfallFinishers: 0,
      },
      layoutMatchesModelRecommendation: true,
      tokenSupplyGaps: {
        gapCount: 4,
        totalPauseSeconds: 120,
      },
    });

    expect(markup).toContain("Token supply gaps");
    expect(markup).toContain("4 gaps");
  });
});
