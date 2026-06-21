import { describe, expect, it } from "vitest";
import { analyzeFinishFunnel } from "../analyzeFinishFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";

describe("analyzeFinishFunnel", () => {
  it("recommends a rounded physical length for a busy burst of finishers", () => {
    const result = analyzeFinishFunnel({
      finishers: [
        { position: 1, name: "", time: "23:00" },
        { position: 2, name: "", time: "23:00" },
        { position: 3, name: "", time: "23:00" },
        { position: 4, name: "", time: "23:01" },
      ],
      laneCount: 1,
      laneLengthMetres: 30,
    });

    expect(result.peakQueueDepth).toBeGreaterThan(2);
    expect(result.funnelNotRequired).toBe(false);
    expect(result.finishLineBackupModelled).toBe(true);
    expect(result.proposedMultiLaneLayout?.sufficient).toBe(true);
    expect(
      result.proposedMultiLaneLayout?.minimumLanesRequired,
    ).toBeGreaterThan(0);
  });

  it("caps queue depth on the chart when the proposed layout is insufficient", () => {
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = analyzeFinishFunnel({
      finishers: Array.from({ length: 10 }, (_, index) => ({
        position: index + 1,
        name: "",
        time: "23:00",
      })),
      maximumLaneCount: 3,
      maximumLaneLengthMetres: 300,
      laneCount: 2,
      laneLengthMetres,
    });

    expect(result.finishLineBackupModelled).toBe(true);
    expect(result.peakQueueDepth).toBe(10);
    expect(
      Math.max(...result.queueDepthOverTime.map((point) => point.queueDepth)),
    ).toBe(4);
    expect(result.proposedMultiLaneLayout?.sufficient).toBe(false);
  });

  it("recommends a layout from site constraints and uncapped peak queue depth", () => {
    const result = analyzeFinishFunnel({
      finishers: Array.from({ length: 10 }, (_, index) => ({
        position: index + 1,
        name: "",
        time: "23:00",
      })),
      maximumLaneCount: 3,
      maximumLaneLengthMetres: 300,
      laneCount: 2,
      laneLengthMetres: 30,
    });

    expect(result.recommendedFunnelLayout).toMatchObject({
      laneCount: 1,
      laneLengthMetres: 13,
      sufficient: true,
    });
  });

  it("clamps finisher spacing to the lane queue zone", () => {
    const result = analyzeFinishFunnel({
      finishers: [{ position: 1, name: "", time: "23:00" }],
      laneCount: 1,
      laneLengthMetres: 30,
      finisherSpacingMetres: 26,
    });

    expect(result.proposedMultiLaneLayout?.combinedLaneCapacity).toBe(1);
  });

  it("reports finish-line backup delays when admissions are blocked", () => {
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = analyzeFinishFunnel({
      finishers: Array.from({ length: 5 }, (_, index) => ({
        position: index + 1,
        name: "",
        time: "23:00",
      })),
      laneCount: 2,
      laneLengthMetres,
    });

    expect(result.finishLineBackupDelays).toMatchObject({
      delayedFinisherCount: 1,
    });
    expect(result.finishLineBackupDelays?.maxDelaySeconds).toBeGreaterThan(0);
    expect(result.finishLineBackupDelays?.averageDelaySeconds).toBe(
      result.finishLineBackupDelays?.maxDelaySeconds,
    );
  });

  it("reports a quiet event may not need a roped-off funnel", () => {
    const result = analyzeFinishFunnel({
      finishers: [
        { position: 1, name: "", time: "18:30" },
        { position: 2, name: "", time: "19:45" },
      ],
    });

    expect(result.funnelNotRequired).toBe(true);
    expect(
      result.proposedMultiLaneLayout?.minimumLanesRequired,
    ).toBeUndefined();
  });
});
