import type { FinishLineBackupDelaySummary } from "./finishLineBackupDelays";
import type { TokenSupplyGapSummary } from "./tokenSupplyGapSummary";
import { formatFinishClockTime } from "./formatFinishClockTime";
import type { ProposedMultiLaneLayoutCheck } from "./multiLaneFunnel";

export function buildMetricsMarkup({
  peakQueueDepth,
  proposedMultiLaneLayout,
  finishLineBackupDelays,
  tokenSupplyGaps,
}: {
  peakQueueDepth: number;
  proposedMultiLaneLayout: ProposedMultiLaneLayoutCheck;
  finishLineBackupDelays?: FinishLineBackupDelaySummary;
  tokenSupplyGaps?: TokenSupplyGapSummary;
}): string {
  const adequacyText = proposedMultiLaneLayout.sufficient
    ? `Sufficient (${proposedMultiLaneLayout.headroomFinishers} finisher headroom)`
    : `Short by ${proposedMultiLaneLayout.shortfallFinishers} finishers`;

  const finishLineBackupMarkup =
    finishLineBackupDelays === undefined
      ? ""
      : `
    <div class="metric">
      <span>Finish-line backup delay</span>
      <strong>${formatFinishClockTime(finishLineBackupDelays.maxDelaySeconds)}</strong>
      max · ${formatFinishClockTime(finishLineBackupDelays.averageDelaySeconds)} avg
      (${finishLineBackupDelays.delayedFinisherCount} finishers)
    </div>`;

  const tokenSupplyGapMarkup =
    tokenSupplyGaps === undefined
      ? ""
      : `
    <div class="metric">
      <span>Token supply gaps</span>
      <strong>${formatFinishClockTime(tokenSupplyGaps.totalPauseSeconds)}</strong>
      total · ${tokenSupplyGaps.gapCount} gaps
    </div>`;

  return `
    <div class="metric">
      <span>Peak queue capacity</span>
      <strong>${peakQueueDepth}</strong>
      finishers
    </div>
    <div class="metric">
      <span>Minimum lanes required</span>
      <strong>${proposedMultiLaneLayout.minimumLanesRequired}</strong>
      at configured lane length
    </div>
    <div class="metric">
      <span>Combined lane capacity</span>
      <strong>${proposedMultiLaneLayout.combinedLaneCapacity}</strong>
      finishers in proposed layout
    </div>
    <div class="metric adequacy ${proposedMultiLaneLayout.sufficient ? "ok" : "bad"}">
      <span>Proposed layout</span>
      <strong>${adequacyText}</strong>
    </div>${finishLineBackupMarkup}${tokenSupplyGapMarkup}
  `;
}
