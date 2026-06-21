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
      onMomentChange,
    });

    canvas.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(onMomentChange).toHaveBeenCalledWith(1251);
  });
});
