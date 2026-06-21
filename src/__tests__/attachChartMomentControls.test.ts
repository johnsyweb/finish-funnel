// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { attachChartMomentControls } from "../attachChartMomentControls";

describe("attachChartMomentControls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates the selected moment when the chart is clicked", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 640,
      top: 0,
      right: 740,
      bottom: 320,
      height: 320,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    const onMomentChange = vi.fn();

    attachChartMomentControls({
      canvas,
      getRange: () => ({ minTimeSeconds: 1200, maxTimeSeconds: 1260 }),
      getMoment: () => 1250,
      getBatchMarkerMoments: () => [],
      onMomentChange,
    });

    canvas.dispatchEvent(
      new MouseEvent("mousedown", { clientX: 100 + 48, bubbles: true }),
    );

    expect(onMomentChange).toHaveBeenCalledWith(1200);
  });

  it("nudges the selected moment with arrow keys when the chart is focused", () => {
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 0;
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });

    const onMomentChange = vi.fn();

    attachChartMomentControls({
      canvas,
      getRange: () => ({ minTimeSeconds: 1200, maxTimeSeconds: 1260 }),
      getMoment: () => 1250,
      getBatchMarkerMoments: () => [],
      onMomentChange,
    });

    canvas.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(onMomentChange).toHaveBeenCalledWith(1251);
  });

  it("jumps to the next batch marker moment with Page Down", () => {
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 0;

    const onMomentChange = vi.fn();

    attachChartMomentControls({
      canvas,
      getRange: () => ({ minTimeSeconds: 1200, maxTimeSeconds: 1260 }),
      getMoment: () => 1250,
      getBatchMarkerMoments: () => [
        { letter: "A", momentSeconds: 1230 },
        { letter: "B", momentSeconds: 1255 },
      ],
      onMomentChange,
    });

    canvas.dispatchEvent(
      new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }),
    );

    expect(onMomentChange).toHaveBeenCalledWith(1255);
  });

  it("selects a batch marker moment when its tick is clicked", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 640,
      top: 0,
      right: 740,
      bottom: 320,
      height: 320,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    const onMomentChange = vi.fn();
    const batchMoment = 1230;

    attachChartMomentControls({
      canvas,
      getRange: () => ({ minTimeSeconds: 1200, maxTimeSeconds: 1260 }),
      getMoment: () => 1250,
      getBatchMarkerMoments: () => [
        { letter: "A", momentSeconds: batchMoment },
      ],
      onMomentChange,
    });

    const batchX =
      48 + ((batchMoment - 1200) / (1260 - 1200)) * (640 - 48 - 16);

    canvas.dispatchEvent(
      new MouseEvent("mousedown", { clientX: 100 + batchX, bubbles: true }),
    );

    expect(onMomentChange).toHaveBeenCalledWith(batchMoment);
  });
});
