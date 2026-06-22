import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { attachCanvasResizeHandler } from "./attachCanvasResizeHandler";
import { attachChartMomentControls } from "./attachChartMomentControls";
import { buildAppMarkup } from "./buildAppMarkup";
import { buildLayoutSetupMarkup } from "./buildLayoutSetupMarkup";
import { buildMetricsMarkup } from "./buildMetricsMarkup";
import {
  buildEventResultsTableMarkup,
  parseQueueSearchFilter,
} from "./buildQueueVisualisationMarkup";
import {
  buildQueueMomentSummaryMarkup,
  queueMomentHeading,
} from "./buildQueueMomentSummaryMarkup";
import {
  clampSelectedMoment,
  timeRangeFromChartPoints,
  type ChartTimeRange,
} from "./chartMomentMapping";
import {
  clampLayoutToSiteConstraints,
  layoutMatchesModelRecommendation,
} from "./clampLayout";
import {
  DEFAULT_CORDON_STAKE_SPACING_METRES,
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FIXTURE_ID,
} from "./defaults";
import {
  finisherSpacingMetresFromInput,
  maximumFinisherSpacingMetres,
} from "./finisherSpacingLimits";
import { fixtureLayoutDefaults } from "./fixtureLayoutDefaults";
import { fixtureTokenDefaults } from "./fixtureTokenDefaults";
import { drawQueueDepthChart } from "./drawQueueDepthChart";
import {
  buildQueueChartLegendMarkup,
  queueChartLegendItems,
} from "./buildQueueChartLegendMarkup";
import { formatFinishClockTime } from "./formatFinishClockTime";
import { orderFixturesForDisplay } from "./orderFixturesForDisplay";
import { eventResultsAtMoment } from "./eventResultsAtMoment";
import { firstMomentAtPeakQueueDepth } from "./eventResultsAtMoment";
import { resolveCallout } from "./resolveCallout";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import type { EventFinisherInput } from "./analyzeFinishFunnel";
import type { ModelRecommendation } from "./recommendFunnelLayout";
import type { FinishTokensSettings } from "./types";

type EventFixture = {
  id: string;
  eventName: string;
  eventNumber: number;
  countryUrl: string;
  finishers: EventFinisherInput[];
};

const fixtures: EventFixture[] = orderFixturesForDisplay([
  await fetch("/fixtures/bushy-1095.json").then((response) => response.json()),
  await fetch("/fixtures/mernda-400.json").then((response) => response.json()),
  await fetch("/fixtures/albert-melbourne-693.json").then((response) =>
    response.json(),
  ),
]);

const app = document.querySelector<HTMLElement>("#app");
if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = buildAppMarkup();

const eventSelect = document.querySelector<HTMLSelectElement>("#event-select")!;
const tokensPerMinuteInput =
  document.querySelector<HTMLInputElement>("#tokens-per-minute")!;
const volunteerCountInput =
  document.querySelector<HTMLInputElement>("#volunteer-count")!;
const tokenSupplyBatchSizeInput = document.querySelector<HTMLInputElement>(
  "#token-supply-batch-size",
)!;
const tokenSupplyFetchDelayInput = document.querySelector<HTMLInputElement>(
  "#token-supply-fetch-delay",
)!;
const maximumLaneLengthInput = document.querySelector<HTMLInputElement>(
  "#maximum-lane-length",
)!;
const maximumLaneCountInput = document.querySelector<HTMLInputElement>(
  "#maximum-lane-count",
)!;
const decelerationZoneInput =
  document.querySelector<HTMLInputElement>("#deceleration-zone")!;
const finisherSpacingInput =
  document.querySelector<HTMLInputElement>("#finisher-spacing")!;
const cordonStakeSpacingInput = document.querySelector<HTMLInputElement>(
  "#cordon-stake-spacing",
)!;
const layoutLaneCountInput =
  document.querySelector<HTMLInputElement>("#layout-lane-count")!;
const layoutLaneLengthInput = document.querySelector<HTMLInputElement>(
  "#layout-lane-length",
)!;
const resetToModelRecommendationButton =
  document.querySelector<HTMLButtonElement>("#reset-to-model-recommendation")!;
const callout = document.querySelector<HTMLDivElement>("#callout")!;
const metrics = document.querySelector<HTMLDivElement>("#metrics")!;
const layoutSetupMount = document.querySelector<HTMLDivElement>(
  "#layout-setup-mount",
)!;
const chartSelectedMoment = document.querySelector<HTMLParagraphElement>(
  "#chart-selected-moment",
)!;
const chartCanvas = document.querySelector<HTMLCanvasElement>("#queue-chart")!;
const chartWrap = document.querySelector<HTMLElement>("#chart-wrap")!;
const chartLegendMount = document.querySelector<HTMLDivElement>(
  "#queue-chart-legend-mount",
)!;
const queueMomentHeadingElement = document.querySelector<HTMLHeadingElement>(
  "#queue-moment-heading",
)!;
const queueSummaryMount = document.querySelector<HTMLDivElement>(
  "#queue-summary-mount",
)!;
const queueSearchInput =
  document.querySelector<HTMLInputElement>("#queue-search")!;
const queueTableMount =
  document.querySelector<HTMLDivElement>("#queue-table-mount")!;

for (const fixture of fixtures) {
  const option = document.createElement("option");
  option.value = fixture.id;
  option.textContent = `${fixture.eventName} #${fixture.eventNumber}`;
  eventSelect.append(option);
}
eventSelect.value = DEFAULT_FIXTURE_ID;

let selectedMomentSeconds = 0;
let layoutStateKey = "";
let chartTimeRange: ChartTimeRange = { minTimeSeconds: 0, maxTimeSeconds: 0 };
let batchMarkerMoments: BatchMarkerMoment[] = [];

function readNumberInput(input: HTMLInputElement, fallback: number): number {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function readDecelerationZoneMetres(): number {
  return readNumberInput(
    decelerationZoneInput,
    DEFAULT_DECELERATION_ZONE_METRES,
  );
}

function readMaximumLaneLengthMetres(): number {
  return readNumberInput(maximumLaneLengthInput, 30);
}

function readMaximumLaneCount(): number {
  return readNumberInput(maximumLaneCountInput, 1);
}

function readSiteConstraints() {
  return {
    maximumLaneLengthMetres: readMaximumLaneLengthMetres(),
    maximumLaneCount: readMaximumLaneCount(),
  };
}

function readLayoutRaw() {
  return {
    laneCount: readNumberInput(layoutLaneCountInput, 1),
    laneLengthMetres: readNumberInput(layoutLaneLengthInput, 30),
  };
}

function readLayout() {
  return clampLayoutToSiteConstraints({
    ...readLayoutRaw(),
    ...readSiteConstraints(),
  });
}

function writeLayout(layout: { laneCount: number; laneLengthMetres: number }) {
  layoutLaneCountInput.value = String(layout.laneCount);
  layoutLaneLengthInput.value = String(layout.laneLengthMetres);
}

function readCordonStakeSpacingMetres(): number {
  return Math.max(
    1,
    readNumberInput(
      cordonStakeSpacingInput,
      DEFAULT_CORDON_STAKE_SPACING_METRES,
    ),
  );
}

function readFinisherSpacingMetres(): number {
  return finisherSpacingMetresFromInput({
    rawValue: finisherSpacingInput.value,
    fallback: DEFAULT_FINISHER_SPACING_METRES,
    laneLengthMetres: readLayout().laneLengthMetres,
    decelerationZoneMetres: readDecelerationZoneMetres(),
  });
}

function syncFinisherSpacingInput(): void {
  const { laneLengthMetres } = readLayout();
  const decelerationZoneMetres = readDecelerationZoneMetres();
  const maximum = maximumFinisherSpacingMetres({
    laneLengthMetres,
    decelerationZoneMetres,
  });

  finisherSpacingInput.max = String(maximum);

  const parsed = Number(finisherSpacingInput.value);
  if (Number.isFinite(parsed) && parsed > maximum) {
    finisherSpacingInput.value = String(maximum);
  }
}

function selectedFixture(): EventFixture {
  const fixture = fixtures.find((entry) => entry.id === eventSelect.value);
  if (!fixture) {
    throw new Error("Fixture not found");
  }
  return fixture;
}

function applySiteConstraintDefaults(fixtureId: string): void {
  const defaults = fixtureLayoutDefaults(fixtureId);
  maximumLaneCountInput.value = String(defaults.maximumLaneCount);
  maximumLaneLengthInput.value = String(defaults.maximumLaneLengthMetres);
}

function applyModelRecommendationToLayout(
  modelRecommendation: ModelRecommendation,
): void {
  writeLayout({
    laneCount: modelRecommendation.laneCount,
    laneLengthMetres: modelRecommendation.laneLengthMetres,
  });
}

function applyFixtureTokenDefaults(fixtureId: string): void {
  const defaults = fixtureTokenDefaults(fixtureId);
  tokenSupplyBatchSizeInput.value = String(defaults.tokenSupplyBatchSize);
}

function readFinishTokensSettings() {
  return {
    tokensPerMinutePerVolunteer: readNumberInput(tokensPerMinuteInput, 15),
    volunteerCount: readNumberInput(volunteerCountInput, 1),
    tokenSupplyBatchSize: readNumberInput(tokenSupplyBatchSizeInput, 100),
    tokenSupplyFetchDelaySeconds: readNumberInput(
      tokenSupplyFetchDelayInput,
      30,
    ),
  };
}

function currentLayoutStateKey(fixtureId: string): string {
  return JSON.stringify({
    fixtureId,
    ...readFinishTokensSettings(),
    finisherSpacingInput: finisherSpacingInput.value,
    decelerationZoneMetres: readDecelerationZoneMetres(),
    ...readSiteConstraints(),
  });
}

function renderQueueVisualisation(
  fixture: EventFixture,
  finishTokensSettings: FinishTokensSettings,
  layout: {
    laneCount: number;
    laneLengthMetres: number;
    decelerationZoneMetres: number;
    finisherSpacingMetres: number;
  },
): void {
  const searchFilter = parseQueueSearchFilter(queueSearchInput.value);
  const queueResult = eventResultsAtMoment({
    finishers: fixture.finishers,
    finishTokensSettings,
    momentSeconds: selectedMomentSeconds,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres: layout.decelerationZoneMetres,
    finisherSpacingMetres: layout.finisherSpacingMetres,
    ...searchFilter,
  });

  queueMomentHeadingElement.textContent = queueMomentHeading(
    queueResult.queueDepth,
  );
  queueSummaryMount.innerHTML = buildQueueMomentSummaryMarkup(
    queueResult.queueMomentSummary,
  );
  queueTableMount.innerHTML = buildEventResultsTableMarkup(
    queueResult.finishers,
    {
      totalCount: queueResult.totalCount,
      visibleCount: queueResult.visibleCount,
    },
  );
}

function render(resetSelectedMoment = false): void {
  const fixture = selectedFixture();
  const finishTokensSettings = readFinishTokensSettings();
  const decelerationZoneMetres = readDecelerationZoneMetres();
  const siteConstraints = readSiteConstraints();
  const nextLayoutStateKey = currentLayoutStateKey(fixture.id);
  const layoutChanged = nextLayoutStateKey !== layoutStateKey;

  if (layoutChanged) {
    const preview = analyzeFinishFunnel({
      finishers: fixture.finishers,
      finishTokensSettings,
      decelerationZoneMetres,
      finisherSpacingMetres: readFinisherSpacingMetres(),
      ...siteConstraints,
      ...readLayoutRaw(),
    });

    if (preview.recommendedFunnelLayout !== undefined) {
      applyModelRecommendationToLayout(preview.recommendedFunnelLayout);
    }

    layoutStateKey = nextLayoutStateKey;
  }

  syncFinisherSpacingInput();

  const layout = readLayout();
  writeLayout(layout);

  const finisherSpacingMetres = readFinisherSpacingMetres();

  const result = analyzeFinishFunnel({
    finishers: fixture.finishers,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
    ...siteConstraints,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
  });

  chartTimeRange = timeRangeFromChartPoints(result.queueDepthOverTime);
  batchMarkerMoments = result.batchMarkerMoments;
  const peakMoment = firstMomentAtPeakQueueDepth(
    result.queueDepthOverTime,
    result.peakQueueDepth,
  );

  if (resetSelectedMoment || layoutChanged) {
    selectedMomentSeconds = peakMoment;
  }

  selectedMomentSeconds = clampSelectedMoment(
    selectedMomentSeconds,
    chartTimeRange,
  );

  const modelRecommendation = result.recommendedFunnelLayout ?? {
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
  };

  const layoutCheck = result.proposedMultiLaneLayout ?? {
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

  resetToModelRecommendationButton.hidden = layoutMatchesModel;

  const calloutState = resolveCallout({
    funnelNotRequired: result.funnelNotRequired,
    combinedLaneCapacity: layoutCheck.combinedLaneCapacity,
    peakQueueDepth: result.peakQueueDepth,
    finishLineBackupModelled: result.finishLineBackupModelled,
  });

  if (calloutState.hidden) {
    callout.hidden = true;
  } else {
    callout.hidden = false;
    callout.className = calloutState.className;
    callout.textContent = calloutState.text;
  }

  metrics.innerHTML = buildMetricsMarkup({
    peakQueueDepth: result.peakQueueDepth,
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
    finishLineBackupDelays: result.finishLineBackupDelays,
    tokenSupplyGaps: result.tokenSupplyGaps,
  });

  const batchMarkerCardsNeeded =
    layout.laneCount > 1 ? result.batchMarkerMoments.length : undefined;

  layoutSetupMount.innerHTML = buildLayoutSetupMarkup({
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    cordonStakeSpacingMetres: readCordonStakeSpacingMetres(),
    batchMarkerCardsNeeded,
  });

  chartSelectedMoment.textContent = `Selected moment: ${formatFinishClockTime(selectedMomentSeconds)}`;

  const modelRecommendationQueueCapacity = layoutMatchesModel
    ? undefined
    : modelRecommendation.combinedLaneCapacity;

  drawQueueDepthChart(chartCanvas, result.queueDepthOverTime, {
    peakQueueDepth: result.peakQueueDepth,
    layoutQueueCapacity: layoutCheck.combinedLaneCapacity,
    modelRecommendationQueueCapacity,
    selectedMomentSeconds,
    batchMarkerMoments,
  });

  chartLegendMount.innerHTML = buildQueueChartLegendMarkup(
    queueChartLegendItems({
      layoutQueueCapacity: layoutCheck.combinedLaneCapacity,
      modelRecommendationQueueCapacity,
      batchMarkerMomentCount: batchMarkerMoments.length,
    }),
  );

  renderQueueVisualisation(fixture, finishTokensSettings, {
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
}

for (const element of [
  tokensPerMinuteInput,
  volunteerCountInput,
  tokenSupplyBatchSizeInput,
  tokenSupplyFetchDelayInput,
  finisherSpacingInput,
  decelerationZoneInput,
  maximumLaneLengthInput,
  maximumLaneCountInput,
]) {
  element.addEventListener("input", () => render(true));
}

cordonStakeSpacingInput.addEventListener("input", () => render());

for (const element of [layoutLaneCountInput, layoutLaneLengthInput]) {
  element.addEventListener("input", () => render());
}

resetToModelRecommendationButton.addEventListener("click", () => {
  const preview = analyzeFinishFunnel({
    finishers: selectedFixture().finishers,
    finishTokensSettings: readFinishTokensSettings(),
    decelerationZoneMetres: readDecelerationZoneMetres(),
    finisherSpacingMetres: readFinisherSpacingMetres(),
    ...readSiteConstraints(),
    ...readLayoutRaw(),
  });

  if (preview.recommendedFunnelLayout !== undefined) {
    applyModelRecommendationToLayout(preview.recommendedFunnelLayout);
  }

  render();
});

eventSelect.addEventListener("change", () => {
  applySiteConstraintDefaults(eventSelect.value);
  applyFixtureTokenDefaults(eventSelect.value);
  render(true);
});
queueSearchInput.addEventListener("input", () => render());

attachCanvasResizeHandler(chartWrap, () => render());
attachChartMomentControls({
  canvas: chartCanvas,
  getRange: () => chartTimeRange,
  getMoment: () => selectedMomentSeconds,
  getBatchMarkerMoments: () => batchMarkerMoments,
  onMomentChange: (momentSeconds) => {
    selectedMomentSeconds = momentSeconds;
    render();
  },
});

applySiteConstraintDefaults(DEFAULT_FIXTURE_ID);
applyFixtureTokenDefaults(DEFAULT_FIXTURE_ID);
render(true);
