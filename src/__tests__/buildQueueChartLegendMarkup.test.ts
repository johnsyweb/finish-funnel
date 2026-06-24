import { describe, expect, it } from "vitest";
import {
  buildQueueChartLegendMarkup,
  queueChartLegendItems,
} from "../buildQueueChartLegendMarkup";

describe("queueChartLegendItems", () => {
  it("lists layout capacity by default", () => {
    expect(
      queueChartLegendItems({
        layoutQueueCapacity: 786,
        batchMarkerMomentCount: 0,
      }).map((item) => item.label),
    ).toEqual(["Queue depth", "Peak queue capacity", "Layout capacity"]);
  });

  it("includes model recommendation capacity only when layout differs", () => {
    expect(
      queueChartLegendItems({
        layoutQueueCapacity: 786,
        modelRecommendationQueueCapacity: 1044,
        batchMarkerMomentCount: 0,
      }).map((item) => item.label),
    ).toEqual([
      "Queue depth",
      "Peak queue capacity",
      "Layout capacity",
      "Model recommendation capacity",
    ]);
  });

  it("includes batch marker moment when batch markers are modelled", () => {
    expect(
      queueChartLegendItems({
        layoutQueueCapacity: 786,
        batchMarkerMomentCount: 3,
      }).map((item) => item.label),
    ).toContain("Batch marker moment");
  });
});

describe("buildQueueChartLegendMarkup", () => {
  it("renders layout capacity swatches", () => {
    const markup = buildQueueChartLegendMarkup([
      { label: "Layout capacity", swatch: "layout-capacity" },
    ]);

    expect(markup).toContain(
      'class="chart-legend-swatch chart-legend-swatch--layout-capacity"',
    );
  });

  it("exposes accessible swatch descriptions and a chart legend label", () => {
    const markup = buildQueueChartLegendMarkup(
      [
        { label: "Queue depth", swatch: "queue-depth" },
        { label: "Peak queue capacity", swatch: "peak-capacity" },
        { label: "Layout capacity", swatch: "layout-capacity" },
        { label: "Batch marker moment", swatch: "batch-marker-moment" },
      ],
      { legendId: "finish-funnel-chart-legend" },
    );

    expect(markup).toContain('id="finish-funnel-chart-legend"');
    expect(markup).toContain('aria-label="Chart legend"');
    expect(markup).toContain('aria-label="Solid orange line"');
    expect(markup).toContain('aria-label="Red dashed horizontal line"');
    expect(markup).toContain('aria-label="Green dashed horizontal line"');
    expect(markup).toContain('aria-label="Orange vertical line"');
    expect(markup).toContain("Batch marker moment");
  });
});
