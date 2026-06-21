import type { EventResultAtMoment } from "./eventResultsAtMoment";

export function parseQueueSearchFilter(value: string): {
  nameFilter?: string;
  finishPositionFilter?: number;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  if (/^\d+$/.test(trimmed)) {
    return { finishPositionFilter: Number(trimmed) };
  }

  return { nameFilter: trimmed };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBatchCell(finisher: EventResultAtMoment): string {
  if (finisher.physicalBatch === undefined) {
    return "";
  }

  const batchLabel = escapeHtml(finisher.physicalBatch);

  if (!finisher.isBatchMarkerHolder) {
    return batchLabel;
  }

  return `<span class="queue-batch-holder">${batchLabel} <span class="queue-batch-card" aria-label="${batchLabel}, batch marker holder">card</span></span>`;
}

export function buildEventResultsTableMarkup(
  finishers: EventResultAtMoment[],
  {
    totalCount,
    visibleCount,
  }: {
    totalCount: number;
    visibleCount: number;
  },
): string {
  if (totalCount === 0) {
    return '<p class="queue-empty">No finishers in the loaded event results.</p>';
  }

  const rows = finishers
    .map((finisher) => {
      const estimatedBadge = finisher.estimated
        ? ' <span class="queue-estimated">Estimated</span>'
        : "";

      return `<tr>
        <td>${finisher.position}</td>
        <td>${escapeHtml(finisher.name)}${estimatedBadge}</td>
        <td>${escapeHtml(finisher.publishedFinishTime)}</td>
        <td>${escapeHtml(finisher.status)}</td>
        <td>${escapeHtml(finisher.lane)}</td>
        <td>${formatBatchCell(finisher)}</td>
        <td>${escapeHtml(finisher.queuePosition)}</td>
        <td>${escapeHtml(finisher.timeWaiting)}</td>
        <td>${escapeHtml(finisher.timeUntilToken)}</td>
        <td>${escapeHtml(finisher.totalEstimatedQueueingTime)}</td>
        <td>${escapeHtml(finisher.finishTokensVolunteer)}</td>
      </tr>`;
    })
    .join("");

  const filterSummary =
    visibleCount === totalCount
      ? `${totalCount} finishers`
      : `${visibleCount} of ${totalCount} finishers shown`;

  return `<div class="queue-table-wrap">
    <table class="queue-table" aria-label="Event results at the selected moment">
      <caption>Event results at the selected moment (${filterSummary})</caption>
      <thead>
        <tr>
          <th scope="col">Finish position</th>
          <th scope="col">Name</th>
          <th scope="col">Finish time</th>
          <th scope="col">Status</th>
          <th scope="col">Lane</th>
          <th scope="col">Batch</th>
          <th scope="col">Queue position</th>
          <th scope="col">Time waiting</th>
          <th scope="col">Time until token</th>
          <th scope="col">Total estimated queueing time</th>
          <th scope="col">Finish Tokens volunteer</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/** @deprecated Use buildEventResultsTableMarkup */
export const buildQueueTableMarkup = buildEventResultsTableMarkup;
