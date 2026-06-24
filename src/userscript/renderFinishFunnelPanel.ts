import type { analyzeFinishFunnel } from "../analyzeFinishFunnel";
import { layoutMatchesModelRecommendation } from "../clampLayout";
import { buildLayoutSetupMarkup } from "../buildLayoutSetupMarkup";
import { buildMetricsMarkup } from "../buildMetricsMarkup";
import {
  buildQueueChartLegendMarkup,
  queueChartLegendItems,
} from "../buildQueueChartLegendMarkup";
import {
  buildQueueMomentSummaryMarkup,
  queueMomentHeading,
} from "../buildQueueMomentSummaryMarkup";
import {
  clampSelectedMoment,
  timeRangeFromChartPoints,
  type ChartTimeRange,
} from "../chartMomentMapping";
import { drawQueueDepthChart } from "../drawQueueDepthChart";
import { eventResultsAtMoment } from "../eventResultsAtMoment";
import { finishFunnelColumnMarkupByPosition } from "../buildFinishFunnelColumnMarkup";
import { formatFinishClockTime } from "../formatFinishClockTime";
import type { FinishTokensSettings } from "../types";
import type { PersistedEventSettings } from "../persistedEventSettings";
import { resolveCallout } from "../resolveCallout";
import type { parseResultsFromDocument } from "../parseResultsFromDocument";

export type FinishFunnelPanelRenderInput = {
  analysis: ReturnType<typeof analyzeFinishFunnel>;
  persisted: PersistedEventSettings;
  finishTokensSettings: FinishTokensSettings;
  layout: { laneCount: number; laneLengthMetres: number };
  finishers: ReturnType<typeof parseResultsFromDocument>;
  momentSeconds: number;
};

export type FinishFunnelPanelRenderResult = {
  chartTimeRange: ChartTimeRange;
  momentSeconds: number;
  finishFunnelMarkupByPosition: Map<number, string>;
};

export function renderFinishFunnelPanel(
  panel: HTMLElement,
  input: FinishFunnelPanelRenderInput,
): FinishFunnelPanelRenderResult {
  const {
    analysis,
    persisted,
    finishTokensSettings,
    layout,
    finishers,
    momentSeconds: requestedMomentSeconds,
  } = input;

  const chartTimeRange = timeRangeFromChartPoints(analysis.queueDepthOverTime);
  const momentSeconds = clampSelectedMoment(
    requestedMomentSeconds,
    chartTimeRange,
  );

  const modelRecommendation = analysis.recommendedFunnelLayout ?? {
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
  };

  const layoutCheck = analysis.proposedMultiLaneLayout ?? {
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
    minimumLanesRequired: 0,
  };

  const layoutMatchesModel = layoutMatchesModelRecommendation(
    layout,
    modelRecommendation,
  );

  const callout = resolveCallout({
    funnelNotRequired: analysis.funnelNotRequired,
    combinedLaneCapacity: layoutCheck.combinedLaneCapacity,
    peakQueueDepth: analysis.peakQueueDepth,
    finishLineBackupModelled: analysis.finishLineBackupModelled,
  });

  const calloutElement = panel.querySelector<HTMLElement>(
    "#finish-funnel-callout",
  );
  if (calloutElement) {
    if (callout.hidden) {
      calloutElement.hidden = true;
    } else {
      calloutElement.hidden = false;
      calloutElement.className = callout.className;
      calloutElement.textContent = callout.text;
    }
  }

  const metricsElement = panel.querySelector("#finish-funnel-metrics");
  if (metricsElement) {
    metricsElement.innerHTML = buildMetricsMarkup({
      peakQueueDepth: analysis.peakQueueDepth,
      eventQueueTimeSummary: analysis.eventQueueTimeSummary,
      layout: {
        laneCount: layout.laneCount,
        laneLengthMetres: layout.laneLengthMetres,
        sufficient: layoutCheck.sufficient,
        combinedLaneCapacity: layoutCheck.combinedLaneCapacity,
        headroomFinishers: layoutCheck.headroomFinishers,
        shortfallFinishers: layoutCheck.shortfallFinishers,
      },
      modelRecommendation,
      layoutMatchesModelRecommendation: layoutMatchesModel,
      finishLineBackupDelays: analysis.finishLineBackupDelays,
      tokenSupplyGaps: analysis.tokenSupplyGaps,
    });
  }

  const batchMarkerCardsNeeded =
    layout.laneCount > 1 ? analysis.batchMarkerMoments.length : undefined;

  const layoutSetupMount = panel.querySelector(
    "#finish-funnel-layout-setup-mount",
  );
  if (layoutSetupMount) {
    layoutSetupMount.innerHTML = buildLayoutSetupMarkup({
      laneCount: layout.laneCount,
      laneLengthMetres: layout.laneLengthMetres,
      cordonStakeSpacingMetres: persisted.cordonStakeSpacingMetres,
      batchMarkerCardsNeeded,
    });
  }

  const chartSelectedMoment = panel.querySelector(
    "#finish-funnel-chart-selected-moment",
  );
  if (chartSelectedMoment) {
    chartSelectedMoment.textContent = `Selected moment: ${formatFinishClockTime(momentSeconds)}`;
  }

  const modelRecommendationQueueCapacity = layoutMatchesModel
    ? undefined
    : modelRecommendation.combinedLaneCapacity;

  const chartCanvas = panel.querySelector<HTMLCanvasElement>(
    "#finish-funnel-queue-chart",
  );
  if (chartCanvas) {
    drawQueueDepthChart(chartCanvas, analysis.queueDepthOverTime, {
      peakQueueDepth: analysis.peakQueueDepth,
      layoutQueueCapacity: layoutCheck.combinedLaneCapacity,
      modelRecommendationQueueCapacity,
      selectedMomentSeconds: momentSeconds,
      batchMarkerMoments: analysis.batchMarkerMoments,
    });
  }

  const chartLegendMount = panel.querySelector(
    "#finish-funnel-chart-legend-mount",
  );
  if (chartLegendMount) {
    chartLegendMount.innerHTML = buildQueueChartLegendMarkup(
      queueChartLegendItems({
        layoutQueueCapacity: layoutCheck.combinedLaneCapacity,
        modelRecommendationQueueCapacity,
        batchMarkerMomentCount: analysis.batchMarkerMoments.length,
      }),
      { legendId: "finish-funnel-chart-legend" },
    );
  }

  const queueResult = eventResultsAtMoment({
    finishers,
    finishTokensSettings,
    momentSeconds,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    finisherSpacingMetres: persisted.finisherSpacingMetres,
  });

  const queueMomentHeadingElement = panel.querySelector(
    "#finish-funnel-queue-moment-heading",
  );
  if (queueMomentHeadingElement) {
    queueMomentHeadingElement.textContent = queueMomentHeading(
      queueResult.queueDepth,
    );
  }

  const queueSummaryMount = panel.querySelector(
    "#finish-funnel-queue-summary-mount",
  );
  if (queueSummaryMount) {
    queueSummaryMount.innerHTML = buildQueueMomentSummaryMarkup(
      queueResult.queueMomentSummary,
    );
  }

  return {
    chartTimeRange,
    momentSeconds,
    finishFunnelMarkupByPosition: finishFunnelColumnMarkupByPosition(
      queueResult.finishers,
    ),
  };
}
