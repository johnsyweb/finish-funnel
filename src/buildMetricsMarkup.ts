import type { FinishLineBackupDelaySummary } from "./finishLineBackupDelays";
import type { ModelRecommendation } from "./recommendFunnelLayout";
import type { TokenSupplyGapSummary } from "./tokenSupplyGapSummary";
import { formatFinishClockTime } from "./formatFinishClockTime";
import type { FunnelLayoutAdequacy } from "./multiLaneFunnel";

function adequacyText(adequacy: FunnelLayoutAdequacy): string {
  return adequacy.sufficient
    ? `Sufficient (${adequacy.headroomFinishers} finisher headroom)`
    : `Short by ${adequacy.shortfallFinishers} finishers`;
}

function layoutSummary(
  laneCount: number,
  laneLengthMetres: number,
  adequacy: FunnelLayoutAdequacy,
): string {
  return `${laneCount} lanes × ${laneLengthMetres} m · ${adequacyText(adequacy)}`;
}

export function buildMetricsMarkup({
  peakQueueDepth,
  layout,
  modelRecommendation,
  layoutMatchesModelRecommendation,
  finishLineBackupDelays,
  tokenSupplyGaps,
}: {
  peakQueueDepth: number;
  layout: {
    laneCount: number;
    laneLengthMetres: number;
  } & FunnelLayoutAdequacy;
  modelRecommendation: ModelRecommendation;
  layoutMatchesModelRecommendation: boolean;
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

  const modelRecommendationMarkup = layoutMatchesModelRecommendation
    ? ""
    : `
    <div class="metric model-recommendation">
      <span>Model recommendation</span>
      <strong>${layoutSummary(modelRecommendation.laneCount, modelRecommendation.laneLengthMetres, modelRecommendation)}</strong>
    </div>`;

  return `
    <div class="metric">
      <span>Peak queue capacity</span>
      <strong>${peakQueueDepth}</strong>
      finishers
    </div>
    <div class="metric adequacy ${layout.sufficient ? "ok" : "bad"}">
      <span>Layout</span>
      <strong>${layoutSummary(layout.laneCount, layout.laneLengthMetres, layout)}</strong>
    </div>${modelRecommendationMarkup}${finishLineBackupMarkup}${tokenSupplyGapMarkup}
  `;
}
