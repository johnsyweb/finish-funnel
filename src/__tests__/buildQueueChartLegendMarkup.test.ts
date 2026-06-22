import { describe, expect, it } from "vitest";
import {
  buildQueueChartLegendMarkup,
  queueChartLegendItems,
} from "../buildQueueChartLegendMarkup";

describe("queueChartLegendItems", () => {
  it("lists queue depth and peak queue capacity by default", () => {
    expect(
      queueChartLegendItems({
        recommendedQueueCapacity: 786,
        batchMarkerMomentCount: 0,
      }),
    ).toEqual([
      { label: "Queue depth", swatch: "queue-depth" },
      { label: "Peak queue capacity", swatch: "peak-capacity" },
      { label: "Recommended capacity", swatch: "recommended-capacity" },
    ]);
  });

  it("includes proposed capacity only when it differs from the recommendation", () => {
    expect(
      queueChartLegendItems({
        recommendedQueueCapacity: 1044,
        proposedQueueCapacity: 786,
        batchMarkerMomentCount: 0,
      }).map((item) => item.label),
    ).toEqual([
      "Queue depth",
      "Peak queue capacity",
      "Recommended capacity",
      "Proposed capacity",
    ]);
  });

  it("includes batch marker moment on multi-lane layouts with markers", () => {
    expect(
      queueChartLegendItems({
        recommendedQueueCapacity: 786,
        batchMarkerMomentCount: 3,
      }).map((item) => item.label),
    ).toContain("Batch marker moment");
  });
});

describe("buildQueueChartLegendMarkup", () => {
  it("renders a list with style-matched swatches and a stable id", () => {
    const markup = buildQueueChartLegendMarkup([
      { label: "Queue depth", swatch: "queue-depth" },
      { label: "Peak queue capacity", swatch: "peak-capacity" },
    ]);

    expect(markup).toContain('id="queue-chart-legend"');
    expect(markup).toContain(
      'class="chart-legend-swatch chart-legend-swatch--queue-depth"',
    );
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("Peak queue capacity");
  });
});
