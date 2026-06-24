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

const SWATCH_ARIA_LABELS: Record<QueueChartLegendSwatch, string> = {
  "queue-depth": "Solid orange line",
  "peak-capacity": "Red dashed horizontal line",
  "layout-capacity": "Green dashed horizontal line",
  "model-recommendation-capacity": "Purple dashed horizontal line",
  "batch-marker-moment": "Orange vertical line",
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
  { legendId = "queue-chart-legend" }: { legendId?: string } = {},
): string {
  if (items.length === 0) {
    return "";
  }

  const listItems = items
    .map((item) => {
      const swatchLabel = SWATCH_ARIA_LABELS[item.swatch];

      return `
    <li>
      <span class="chart-legend-swatch chart-legend-swatch--${item.swatch}" role="img" aria-label="${swatchLabel}"></span>
      <span>${item.label}</span>
    </li>`;
    })
    .join("");

  return `<ul id="${legendId}" class="chart-legend" aria-label="Chart legend">${listItems}
  </ul>`;
}
