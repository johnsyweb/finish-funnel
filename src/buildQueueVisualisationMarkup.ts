import type { QueuedFinisherAtMoment } from "./queuedFinishersAtMoment";

export const QUEUE_PAGE_SIZE = 25;

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

export function queuePageCount(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBatchCell(finisher: QueuedFinisherAtMoment): string {
  if (finisher.physicalBatch === undefined) {
    return "";
  }

  const batchLabel = escapeHtml(finisher.physicalBatch);

  if (!finisher.isBatchMarkerHolder) {
    return batchLabel;
  }

  return `<span class="queue-batch-holder">${batchLabel} <span class="queue-batch-card" aria-label="${batchLabel}, batch marker holder">card</span></span>`;
}

export function buildQueueTableMarkup(
  finishers: QueuedFinisherAtMoment[],
): string {
  if (finishers.length === 0) {
    return '<p class="queue-empty">No finishers are waiting in the queue at the selected moment.</p>';
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
        <td>${escapeHtml(finisher.lane)}</td>
        <td>${formatBatchCell(finisher)}</td>
        <td>${finisher.queuePosition}</td>
        <td>${finisher.timeWaiting}</td>
        <td>${finisher.timeUntilToken}</td>
        <td>${finisher.totalEstimatedQueueingTime}</td>
      </tr>`;
    })
    .join("");

  return `<div class="queue-table-wrap">
    <table class="queue-table" aria-label="Queued finishers at the selected moment">
      <caption>Queued finishers at the selected moment</caption>
      <thead>
        <tr>
          <th scope="col">Finish position</th>
          <th scope="col">Name</th>
          <th scope="col">Finish time</th>
          <th scope="col">Lane</th>
          <th scope="col">Batch</th>
          <th scope="col">Queue position</th>
          <th scope="col">Time waiting</th>
          <th scope="col">Time until token</th>
          <th scope="col">Total estimated queueing time</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function buildQueuePaginationMarkup({
  pageIndex,
  pageCount,
  pageSize,
  totalCount,
}: {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
}): string {
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;
  const rangeStart = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min(totalCount, (pageIndex + 1) * pageSize);

  return `<nav class="queue-pagination" aria-label="Queue pagination">
    <button type="button" id="queue-prev-page" ${canGoPrevious ? "" : "disabled"}>
      Previous page
    </button>
    <span id="queue-page-status">
      Page ${pageIndex + 1} of ${pageCount}
      (${rangeStart}${totalCount === 0 ? "" : `–${rangeEnd}`} of ${totalCount})
    </span>
    <button type="button" id="queue-next-page" ${canGoNext ? "" : "disabled"}>
      Next page
    </button>
  </nav>`;
}
