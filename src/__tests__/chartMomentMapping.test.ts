import { describe, expect, it } from "vitest";
import {
  CHART_TIME_PADDING,
  clampSelectedMoment,
  momentSecondsFromCanvasX,
  nudgeSelectedMoment,
  timeRangeFromChartPoints,
} from "../chartMomentMapping";

describe("chartMomentMapping", () => {
  const range = { minTimeSeconds: 1200, maxTimeSeconds: 1260 };

  it("derives the chart time range from queue depth points", () => {
    expect(
      timeRangeFromChartPoints([
        { timeSeconds: 1200, queueDepth: 0 } as { timeSeconds: number },
        { timeSeconds: 1260, queueDepth: 4 } as { timeSeconds: number },
      ]),
    ).toEqual(range);
  });

  it("maps a canvas x position to clock finish time within the chart range", () => {
    const canvasWidth = 640;
    const leftEdge = momentSecondsFromCanvasX(
      CHART_TIME_PADDING.left,
      canvasWidth,
      range,
    );
    const rightEdge = momentSecondsFromCanvasX(
      canvasWidth - CHART_TIME_PADDING.right,
      canvasWidth,
      range,
    );

    expect(leftEdge).toBe(1200);
    expect(rightEdge).toBe(1260);
  });

  it("clamps a selected moment to the chart time range", () => {
    expect(clampSelectedMoment(1250, range)).toBe(1250);
    expect(clampSelectedMoment(1100, range)).toBe(1200);
    expect(clampSelectedMoment(1300, range)).toBe(1260);
  });

  it("nudges the selected moment by one second for arrow keys", () => {
    expect(nudgeSelectedMoment(1250, -1, range)).toBe(1249);
    expect(nudgeSelectedMoment(1250, 1, range)).toBe(1251);
    expect(nudgeSelectedMoment(1200, -5, range)).toBe(1200);
  });
});
