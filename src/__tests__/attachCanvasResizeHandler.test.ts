// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { attachCanvasResizeHandler } from "../attachCanvasResizeHandler";

describe("attachCanvasResizeHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redraws the chart when the chart container is resized", () => {
    const target = document.createElement("div");
    const onResize = vi.fn();
    let observerCallback: ResizeObserverCallback | undefined;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }

      observe(element: Element) {
        expect(element).toBe(target);
      }

      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);

    attachCanvasResizeHandler(target, onResize);
    observerCallback?.([], {} as ResizeObserver);

    expect(onResize).toHaveBeenCalledOnce();
  });

  it("stops listening when the returned cleanup runs", () => {
    const target = document.createElement("div");
    const onResize = vi.fn();
    const disconnect = vi.fn();

    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}

      observe() {}

      disconnect() {
        disconnect();
      }
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);

    const cleanup = attachCanvasResizeHandler(target, onResize);
    cleanup();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
