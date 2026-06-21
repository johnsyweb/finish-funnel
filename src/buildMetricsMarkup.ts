import type { FinishLineBackupDelaySummary } from "./finishLineBackupDelays";
import type { RecommendedFunnelLayout } from "./recommendFunnelLayout";
import type { TokenSupplyGapSummary } from "./tokenSupplyGapSummary";
import { formatFinishClockTime } from "./formatFinishClockTime";
import type { ProposedMultiLaneLayoutCheck } from "./multiLaneFunnel";

function adequacyText(adequacy: {
  sufficient: boolean;
  headroomFinishers: number;
  shortfallFinishers: number;
}): string {
  return adequacy.sufficient
    ? `Sufficient (${adequacy.headroomFinishers} finisher headroom)`
    : `Short by ${adequacy.shortfallFinishers} finishers`;
}

export function buildMetricsMarkup({
  peakQueueDepth,
  recommendedFunnelLayout,
  proposedMultiLaneLayout,
  proposedMatchesRecommendation,
  finishLineBackupDelays,
  tokenSupplyGaps,
}: {
  peakQueueDepth: number;
  recommendedFunnelLayout: RecommendedFunnelLayout;
  proposedMultiLaneLayout: ProposedMultiLaneLayoutCheck;
  proposedMatchesRecommendation: boolean;
  finishLineBackupDelays?: FinishLineBackupDelaySummary;
  tokenSupplyGaps?: TokenSupplyGapSummary;
}): string {
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

  const proposedAdequacyMarkup = proposedMatchesRecommendation
    ? ""
    : `
    <div class="metric adequacy ${proposedMultiLaneLayout.sufficient ? "ok" : "bad"}">
      <span>Proposed layout</span>
      <strong>${adequacyText(proposedMultiLaneLayout)}</strong>
    </div>`;

  return `
    <div class="metric">
      <span>Peak queue capacity</span>
      <strong>${peakQueueDepth}</strong>
      finishers
    </div>
    <div class="metric">
      <span>Recommended layout</span>
      <strong>${recommendedFunnelLayout.laneCount} lanes × ${recommendedFunnelLayout.laneLengthMetres} m</strong>
    </div>
    <div class="metric adequacy ${recommendedFunnelLayout.sufficient ? "ok" : "bad"}">
      <span>Recommendation</span>
      <strong>${adequacyText(recommendedFunnelLayout)}</strong>
    </div>${proposedAdequacyMarkup}${finishLineBackupMarkup}${tokenSupplyGapMarkup}
  `;
}
