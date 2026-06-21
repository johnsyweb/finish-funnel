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

export function buildQueueMomentSummaryMarkup(
  summary: QueueMomentSummary,
): string {
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

  return `<dl class="queue-moment-summary">${laneItems}</dl>${blockedMarkup}`;
}

export function queueMomentHeading(queueDepth: number): string {
  return `Queue at selected moment (${queueDepth})`;
}
