export type QueueChartLegendSwatch =
  | "queue-depth"
  | "peak-capacity"
  | "layout-capacity"
  | "model-recommendation-capacity"
  | "batch-marker-moment";

export type QueueChartLegendItem = {
  label: string;
  swatch: QueueChartLegendSwatch;
};

export function queueChartLegendItems({
  layoutQueueCapacity,
  modelRecommendationQueueCapacity,
  batchMarkerMomentCount,
}: {
  layoutQueueCapacity?: number;
  modelRecommendationQueueCapacity?: number;
  batchMarkerMomentCount: number;
}): QueueChartLegendItem[] {
  const items: QueueChartLegendItem[] = [
    { label: "Queue depth", swatch: "queue-depth" },
    { label: "Peak queue capacity", swatch: "peak-capacity" },
  ];

  if (layoutQueueCapacity !== undefined) {
    items.push({
      label: "Layout capacity",
      swatch: "layout-capacity",
    });
  }

  if (modelRecommendationQueueCapacity !== undefined) {
    items.push({
      label: "Model recommendation capacity",
      swatch: "model-recommendation-capacity",
    });
  }

  if (batchMarkerMomentCount > 0) {
    items.push({
      label: "Batch marker moment",
      swatch: "batch-marker-moment",
    });
  }

  return items;
}

export function buildQueueChartLegendMarkup(
  items: QueueChartLegendItem[],
): string {
  if (items.length === 0) {
    return "";
  }

  const listItems = items
    .map(
      (item) => `
    <li>
      <span class="chart-legend-swatch chart-legend-swatch--${item.swatch}" aria-hidden="true"></span>
      ${item.label}
    </li>`,
    )
    .join("");

  return `<ul id="queue-chart-legend" class="chart-legend">${listItems}
  </ul>`;
}
