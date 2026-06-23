import type { EventResultAtMoment } from "./eventResultsAtMoment";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBatchLabel(finisher: EventResultAtMoment): string | undefined {
  if (finisher.physicalBatch === undefined) {
    return undefined;
  }

  const label = escapeHtml(finisher.physicalBatch);

  if (!finisher.isBatchMarkerHolder) {
    return label;
  }

  return `${label} <span class="finish-funnel-batch-card" aria-label="${label}, batch marker holder">card</span>`;
}

export function buildFinishFunnelDetailedMarkup(
  finisher: EventResultAtMoment,
): string {
  const parts: string[] = [];

  if (finisher.lane) {
    parts.push(`Lane ${escapeHtml(finisher.lane)}`);
  }

  const batchLabel = formatBatchLabel(finisher);
  if (batchLabel) {
    parts.push(`batch ${batchLabel}`);
  }

  if (finisher.queuePosition) {
    parts.push(`queue ${escapeHtml(finisher.queuePosition)}`);
  }

  if (finisher.timeWaiting) {
    parts.push(`waiting ${escapeHtml(finisher.timeWaiting)}`);
  }

  if (finisher.timeUntilToken) {
    parts.push(`token in ${escapeHtml(finisher.timeUntilToken)}`);
  }

  if (finisher.totalEstimatedQueueingTime) {
    parts.push(`total ${escapeHtml(finisher.totalEstimatedQueueingTime)}`);
  }

  if (finisher.finishTokensVolunteer) {
    parts.push(escapeHtml(finisher.finishTokensVolunteer));
  }

  if (finisher.estimated) {
    parts.push("estimated arrival");
  }

  return parts.join(" · ");
}

export function buildFinishFunnelColumnCellMarkup(
  finisher: EventResultAtMoment,
): string {
  const compactStatus = escapeHtml(finisher.status);
  const detailed = buildFinishFunnelDetailedMarkup(finisher);

  return `<div class="compact">${compactStatus}</div><div class="detailed">${detailed}</div>`;
}

export function buildEmptyFinishFunnelColumnCellMarkup(): string {
  return '<div class="compact"></div><div class="detailed"></div>';
}

export function finishFunnelColumnMarkupByPosition(
  finishers: EventResultAtMoment[],
): Map<number, string> {
  return new Map(
    finishers.map((finisher) => [
      finisher.position,
      buildFinishFunnelColumnCellMarkup(finisher),
    ]),
  );
}
