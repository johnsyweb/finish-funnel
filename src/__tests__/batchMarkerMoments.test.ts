import { describe, expect, it } from "vitest";
import {
  adjacentBatchMarkerMoment,
  batchMarkerMomentAtCanvasX,
  batchMarkerMomentsFromAssignments,
} from "../batchMarkerMoments";
import { CHART_TIME_PADDING } from "../chartMomentMapping";
import type { FinisherLaneAssignment } from "../assignFinisherLanes";

describe("batchMarkerMomentsFromAssignments", () => {
  it("returns batch letters at finisher arrival times in time order", () => {
    const assignments: FinisherLaneAssignment[] = [
      {
        position: 1,
        arrivalTimeSeconds: 100,
        lane: 1,
        batchMarker: "A",
      },
      {
        position: 2,
        arrivalTimeSeconds: 200,
        lane: 2,
        batchMarker: "B",
      },
      { position: 3, arrivalTimeSeconds: 250, lane: 2 },
    ];

    expect(batchMarkerMomentsFromAssignments(assignments)).toEqual([
      { letter: "A", momentSeconds: 100 },
      { letter: "B", momentSeconds: 200 },
    ]);
  });
});

describe("adjacentBatchMarkerMoment", () => {
  const markers = [
    { letter: "A", momentSeconds: 100 },
    { letter: "B", momentSeconds: 200 },
    { letter: "C", momentSeconds: 300 },
  ];

  it("returns the next batch marker moment after the current moment", () => {
    expect(adjacentBatchMarkerMoment(150, markers, "next")).toBe(200);
  });

  it("returns the previous batch marker moment before the current moment", () => {
    expect(adjacentBatchMarkerMoment(250, markers, "previous")).toBe(200);
  });
});

describe("batchMarkerMomentAtCanvasX", () => {
  const markers = [{ letter: "A", momentSeconds: 1230 }];
  const range = { minTimeSeconds: 1200, maxTimeSeconds: 1260 };

  it("matches a batch tick when the pointer is within tolerance of its x position", () => {
    const canvasWidth = 640;
    const batchX =
      CHART_TIME_PADDING.left +
      ((1230 - 1200) / (1260 - 1200)) *
        (canvasWidth - CHART_TIME_PADDING.left - CHART_TIME_PADDING.right);

    expect(
      batchMarkerMomentAtCanvasX(batchX + 4, canvasWidth, range, markers),
    ).toBe(1230);
    expect(
      batchMarkerMomentAtCanvasX(batchX + 20, canvasWidth, range, markers),
    ).toBeUndefined();
  });
});
