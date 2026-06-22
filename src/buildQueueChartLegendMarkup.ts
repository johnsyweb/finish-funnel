export type QueueChartLegendSwatch =
  | "queue-depth"
  | "peak-capacity"
  | "recommended-capacity"
  | "proposed-capacity"
  | "batch-marker-moment";

export type QueueChartLegendItem = {
  label: string;
  swatch: QueueChartLegendSwatch;
};

export function queueChartLegendItems({
  recommendedQueueCapacity,
  proposedQueueCapacity,
  batchMarkerMomentCount,
}: {
  recommendedQueueCapacity?: number;
  proposedQueueCapacity?: number;
  batchMarkerMomentCount: number;
}): QueueChartLegendItem[] {
  const items: QueueChartLegendItem[] = [
    { label: "Queue depth", swatch: "queue-depth" },
    { label: "Peak queue capacity", swatch: "peak-capacity" },
  ];

  if (recommendedQueueCapacity !== undefined) {
    items.push({
      label: "Recommended capacity",
      swatch: "recommended-capacity",
    });
  }

  if (proposedQueueCapacity !== undefined) {
    items.push({
      label: "Proposed capacity",
      swatch: "proposed-capacity",
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
