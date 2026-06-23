import type { EventResultAtMoment } from "./eventResultsAtMoment";
import {
  buildFinishFunnelColumnCellMarkup,
  buildEmptyFinishFunnelColumnCellMarkup,
} from "./buildFinishFunnelColumnMarkup";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type AugmentedResultsTableRow = {
  position: number;
  name: string;
  publishedFinishTime: string;
  estimated: boolean;
  gender?: string;
  ageGroup?: string;
  club?: string;
  finishFunnel: EventResultAtMoment;
};

export function buildAugmentedResultsTableMarkup(
  rows: AugmentedResultsTableRow[],
  {
    displayMode = "compact",
  }: {
    displayMode?: "compact" | "detailed";
  } = {},
): string {
  if (rows.length === 0) {
    return '<p class="queue-empty">No finishers in the loaded event results.</p>';
  }

  const tableRows = rows
    .map((row) => {
      const estimatedBadge = row.estimated
        ? ' <span class="queue-estimated">Estimated</span>'
        : "";

      return `<tr class="Results-table-row" data-name="${escapeHtml(row.name)}" data-position="${row.position}">
        <td class="Results-table-td Results-table-td--position">${row.position}</td>
        <td class="Results-table-td Results-table-td--name">
          <div class="compact" translate="no">${escapeHtml(row.name)}${estimatedBadge}</div>
        </td>
        <td class="Results-table-td Results-table-td--gender">
          <div class="compact">${escapeHtml(row.gender ?? "")}</div>
        </td>
        <td class="Results-table-td Results-table-td--ageGroup">
          <div class="compact">${escapeHtml(row.ageGroup ?? "")}</div>
        </td>
        <td class="Results-table-td Results-table-td--club">
          <div class="compact" translate="no">${escapeHtml(row.club ?? "")}</div>
        </td>
        <td class="Results-table-td Results-table-td--time">
          <div class="compact" translate="no">${escapeHtml(row.publishedFinishTime)}</div>
        </td>
        <td class="Results-table-td Results-table-td--finishFunnel">${buildFinishFunnelColumnCellMarkup(row.finishFunnel)}</td>
      </tr>`;
    })
    .join("");

  return `<div class="queue-table-wrap">
    <table class="Results-table Results-table--${displayMode} js-ResultsTable" aria-label="Augmented parkrun results at the selected moment">
      <thead>
        <tr class="Results-table-thead">
          <th class="Results-table-th Results-table-th--position">Position</th>
          <th class="Results-table-th Results-table-th--name">parkrunner</th>
          <th class="Results-table-th Results-table-th--gender">Gender</th>
          <th class="Results-table-th Results-table-th--ageGroup">Age Group</th>
          <th class="Results-table-th Results-table-th--club">Group</th>
          <th class="Results-table-th Results-table-th--time">Time</th>
          <th class="Results-table-th Results-table-th--finishFunnel">Finish funnel</th>
        </tr>
      </thead>
      <tbody class="js-ResultsTbody">${tableRows}</tbody>
    </table>
  </div>`;
}

export function augmentedResultsTableRowsFromEventResults(
  finishers: EventResultAtMoment[],
): AugmentedResultsTableRow[] {
  return finishers.map((finisher) => ({
    position: finisher.position,
    name: finisher.name,
    publishedFinishTime: finisher.publishedFinishTime,
    estimated: finisher.estimated,
    finishFunnel: finisher,
  }));
}

export { buildEmptyFinishFunnelColumnCellMarkup };
