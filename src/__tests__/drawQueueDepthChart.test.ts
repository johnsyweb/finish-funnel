// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { drawQueueDepthChart } from "../drawQueueDepthChart";

describe("drawQueueDepthChart", () => {
  it("sizes the canvas to the element display dimensions", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });
    Object.defineProperty(canvas, "clientHeight", {
      value: 320,
      configurable: true,
    });

    const context = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
      textAlign: "left" as CanvasTextAlign,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    };

    vi.spyOn(canvas, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );

    drawQueueDepthChart(
      canvas,
      [
        { timeSeconds: 1200, queueDepth: 0 },
        { timeSeconds: 1260, queueDepth: 4 },
      ],
      { peakQueueDepth: 4, layoutQueueCapacity: 3 },
    );

    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(320);
  });

  it("draws a vertical indicator at the selected moment", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });
    Object.defineProperty(canvas, "clientHeight", {
      value: 320,
      configurable: true,
    });

    const context = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
      textAlign: "left" as CanvasTextAlign,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    };

    vi.spyOn(canvas, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );

    drawQueueDepthChart(
      canvas,
      [
        { timeSeconds: 1200, queueDepth: 0 },
        { timeSeconds: 1260, queueDepth: 4 },
      ],
      {
        peakQueueDepth: 4,
        selectedMomentSeconds: 1230,
      },
    );

    expect(context.fillText).toHaveBeenCalledWith("20:30", 336, 12);
    expect(context.moveTo).toHaveBeenCalledWith(336, 16);
    expect(context.lineTo).toHaveBeenCalledWith(336, 284);
  });

  it("draws batch marker ticks and letters on the timeline", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", {
      value: 640,
      configurable: true,
    });
    Object.defineProperty(canvas, "clientHeight", {
      value: 320,
      configurable: true,
    });

    const context = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
      textAlign: "left" as CanvasTextAlign,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    };

    vi.spyOn(canvas, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );

    drawQueueDepthChart(
      canvas,
      [
        { timeSeconds: 1200, queueDepth: 0 },
        { timeSeconds: 1260, queueDepth: 4 },
      ],
      {
        peakQueueDepth: 4,
        batchMarkerMoments: [{ letter: "A", momentSeconds: 1230 }],
      },
    );

    expect(context.fillText).toHaveBeenCalledWith("A", 336, 12);
    expect(context.moveTo).toHaveBeenCalledWith(336, 16);
    expect(context.lineTo).toHaveBeenCalledWith(336, 284);
  });
});
