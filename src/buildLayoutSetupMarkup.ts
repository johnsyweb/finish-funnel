import { cordonLineCount, cordonStakeCount } from "./cordonStakeCount";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBatchMarkerCardsNeededLabel(count: number): string {
  return count === 1
    ? "Batch marker cards needed: 1"
    : `Batch marker cards needed: ${count}`;
}

export function buildLayoutSetupMarkup({
  laneCount,
  laneLengthMetres,
  cordonStakeSpacingMetres,
  batchMarkerCardsNeeded,
}: {
  laneCount: number;
  laneLengthMetres: number;
  cordonStakeSpacingMetres: number;
  batchMarkerCardsNeeded?: number;
}): string {
  const lineCount = cordonLineCount(laneCount);
  const totalStakes = cordonStakeCount({
    laneCount,
    laneLengthMetres,
    cordonStakeSpacingMetres,
  });
  const laneWord = laneCount === 1 ? "lane" : "lanes";
  const lineWord = lineCount === 1 ? "cordon line" : "cordon lines";
  const contextLine = `${laneCount} ${laneWord} × ${laneLengthMetres} m, ${lineCount} ${lineWord}, stakes every ${cordonStakeSpacingMetres} m (both ends staked)`;
  const batchMarkup =
    batchMarkerCardsNeeded === undefined
      ? ""
      : `<p class="layout-setup-batch-cards"><strong>${escapeHtml(formatBatchMarkerCardsNeededLabel(batchMarkerCardsNeeded))}</strong></p>`;

  return `<p class="layout-setup-stakes"><strong>Cordon stakes needed: ${totalStakes}</strong></p>
<p class="layout-setup-context">${escapeHtml(contextLine)}</p>${batchMarkup}`;
}
