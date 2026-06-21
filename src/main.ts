import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { attachCanvasResizeHandler } from "./attachCanvasResizeHandler";
import { attachChartMomentControls } from "./attachChartMomentControls";
import { buildAppMarkup } from "./buildAppMarkup";
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
  clampProposedFunnelToSiteConstraints,
  proposedFunnelMatchesRecommendation,
} from "./clampProposedFunnel";
import {
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
import { formatFinishClockTime } from "./formatFinishClockTime";
import { orderFixturesForDisplay } from "./orderFixturesForDisplay";
import { eventResultsAtMoment } from "./eventResultsAtMoment";
import { firstMomentAtPeakQueueDepth } from "./eventResultsAtMoment";
import { resolveCallout } from "./resolveCallout";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import type { EventFinisherInput } from "./analyzeFinishFunnel";
import type { RecommendedFunnelLayout } from "./recommendFunnelLayout";
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
const proposedLaneCountInput = document.querySelector<HTMLInputElement>(
  "#proposed-lane-count",
)!;
const proposedLaneLengthInput = document.querySelector<HTMLInputElement>(
  "#proposed-lane-length",
)!;
const callout = document.querySelector<HTMLDivElement>("#callout")!;
const metrics = document.querySelector<HTMLDivElement>("#metrics")!;
const chartSelectedMoment = document.querySelector<HTMLParagraphElement>(
  "#chart-selected-moment",
)!;
const chartCanvas = document.querySelector<HTMLCanvasElement>("#queue-chart")!;
const chartWrap = document.querySelector<HTMLElement>("#chart-wrap")!;
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

function readProposedFunnelRaw() {
  return {
    laneCount: readNumberInput(proposedLaneCountInput, 1),
    laneLengthMetres: readNumberInput(proposedLaneLengthInput, 30),
  };
}

function readProposedFunnel() {
  return clampProposedFunnelToSiteConstraints({
    ...readProposedFunnelRaw(),
    ...readSiteConstraints(),
  });
}

function writeProposedFunnel(proposed: {
  laneCount: number;
  laneLengthMetres: number;
}): void {
  proposedLaneCountInput.value = String(proposed.laneCount);
  proposedLaneLengthInput.value = String(proposed.laneLengthMetres);
}

function readFinisherSpacingMetres(): number {
  return finisherSpacingMetresFromInput({
    rawValue: finisherSpacingInput.value,
    fallback: DEFAULT_FINISHER_SPACING_METRES,
    laneLengthMetres: readProposedFunnel().laneLengthMetres,
    decelerationZoneMetres: readDecelerationZoneMetres(),
  });
}

function syncFinisherSpacingInput(): void {
  const { laneLengthMetres } = readProposedFunnel();
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

function applyRecommendedToProposed(
  recommendation: RecommendedFunnelLayout,
): void {
  writeProposedFunnel({
    laneCount: recommendation.laneCount,
    laneLengthMetres: recommendation.laneLengthMetres,
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
      ...readProposedFunnelRaw(),
    });

    if (preview.recommendedFunnelLayout !== undefined) {
      applyRecommendedToProposed(preview.recommendedFunnelLayout);
    }

    layoutStateKey = nextLayoutStateKey;
  }

  syncFinisherSpacingInput();

  const proposedFunnel = readProposedFunnel();
  writeProposedFunnel(proposedFunnel);

  const finisherSpacingMetres = readFinisherSpacingMetres();

  const result = analyzeFinishFunnel({
    finishers: fixture.finishers,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
    ...siteConstraints,
    laneCount: proposedFunnel.laneCount,
    laneLengthMetres: proposedFunnel.laneLengthMetres,
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

  const recommendedFunnelLayout = result.recommendedFunnelLayout ?? {
    laneCount: proposedFunnel.laneCount,
    laneLengthMetres: proposedFunnel.laneLengthMetres,
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
  };

  const proposedMultiLaneLayout = result.proposedMultiLaneLayout ?? {
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
    minimumLanesRequired: 0,
  };

  const proposedMatchesRecommendation = proposedFunnelMatchesRecommendation(
    proposedFunnel,
    recommendedFunnelLayout,
  );

  const calloutState = resolveCallout({
    funnelNotRequired: result.funnelNotRequired,
    combinedLaneCapacity: proposedMultiLaneLayout.combinedLaneCapacity,
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
    recommendedFunnelLayout,
    proposedMultiLaneLayout,
    proposedMatchesRecommendation,
    finishLineBackupDelays: result.finishLineBackupDelays,
    tokenSupplyGaps: result.tokenSupplyGaps,
  });

  chartSelectedMoment.textContent = `Selected moment: ${formatFinishClockTime(selectedMomentSeconds)}`;

  const proposedQueueCapacity = proposedMatchesRecommendation
    ? undefined
    : proposedMultiLaneLayout.combinedLaneCapacity;

  drawQueueDepthChart(chartCanvas, result.queueDepthOverTime, {
    peakQueueDepth: result.peakQueueDepth,
    recommendedQueueCapacity: recommendedFunnelLayout.combinedLaneCapacity,
    proposedQueueCapacity,
    selectedMomentSeconds,
    batchMarkerMoments,
  });

  renderQueueVisualisation(fixture, finishTokensSettings, {
    laneCount: proposedFunnel.laneCount,
    laneLengthMetres: proposedFunnel.laneLengthMetres,
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

for (const element of [proposedLaneCountInput, proposedLaneLengthInput]) {
  element.addEventListener("input", () => render());
}

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
