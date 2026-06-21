import type { QueueMomentSummary } from "./queueMomentSummary";
import { formatQueueZoneMetres } from "./queueMomentSummary";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBatchLabel(label: string): string {
  return label === "unnamed" ? "unnamed" : label;
}

function formatBatchSummary(
  batches: QueueMomentSummary["lanes"][number]["batches"],
): string {
  if (batches.length === 0) {
    return "";
  }

  const batchText = batches
    .map(({ label, count }) => `${formatBatchLabel(label)} ${count}`)
    .join(", ");

  return `<span class="queue-lane-batches">${escapeHtml(batchText)}</span>`;
}

export function formatBatchMarkerCardsNeededLine(
  batchMarkerCardsNeeded: number | undefined,
): string | undefined {
  if (batchMarkerCardsNeeded === undefined) {
    return undefined;
  }

  const label =
    batchMarkerCardsNeeded === 1
      ? "Batch marker card needed for event: 1"
      : `Batch marker cards needed for event: ${batchMarkerCardsNeeded}`;

  return label;
}

export function buildQueueMomentSummaryMarkup(
  summary: QueueMomentSummary,
): string {
  const batchCardsLine = formatBatchMarkerCardsNeededLine(
    summary.batchMarkerCardsNeeded,
  );
  const batchCardsMarkup = batchCardsLine
    ? `<p class="queue-batch-cards-needed">${escapeHtml(batchCardsLine)}</p>`
    : "";
  const laneItems = summary.lanes
    .map((lane) => {
      const utilisation = `${lane.queuedCount} / ${lane.maxFinishers} finishers · ${formatQueueZoneMetres(lane.occupiedMetres)} / ${formatQueueZoneMetres(lane.maxMetres)} m`;
      const batches = formatBatchSummary(lane.batches);

      return `<div>
      <dt>Lane ${lane.laneNumber}</dt>
      <dd>${escapeHtml(utilisation)}${batches ? ` ${batches}` : ""}</dd>
    </div>`;
    })
    .join("");

  const blockedMarkup =
    summary.finishLineBlockedCount === undefined
      ? ""
      : `<p class="queue-finish-line-blocked">At finish line (not yet in funnel): ${summary.finishLineBlockedCount} finishers</p>`;

  return `${batchCardsMarkup}<dl class="queue-moment-summary">${laneItems}</dl>${blockedMarkup}`;
}

export function queueMomentHeading(queueDepth: number): string {
  return `Queue at selected moment (${queueDepth})`;
}
