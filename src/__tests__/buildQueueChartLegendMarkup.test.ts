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
});
