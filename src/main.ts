import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { attachCanvasResizeHandler } from "./attachCanvasResizeHandler";
import { attachChartMomentControls } from "./attachChartMomentControls";
import { buildAppMarkup } from "./buildAppMarkup";
import { buildMetricsMarkup } from "./buildMetricsMarkup";
import {
  buildQueuePaginationMarkup,
  buildQueueTableMarkup,
  parseQueueSearchFilter,
  QUEUE_PAGE_SIZE,
  queuePageCount,
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
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FIXTURE_ID,
} from "./defaults";
import {
  finisherSpacingMetresFromInput,
  maximumFinisherSpacingMetres,
} from "./finisherSpacingLimits";
import { fixtureLayoutDefaults } from "./fixtureLayoutDefaults";
import { drawQueueDepthChart } from "./drawQueueDepthChart";
import { formatFinishClockTime } from "./formatFinishClockTime";
import { orderFixturesForDisplay } from "./orderFixturesForDisplay";
import {
  firstMomentAtPeakQueueDepth,
  queuedFinishersAtMoment,
} from "./queuedFinishersAtMoment";
import { resolveCallout } from "./resolveCallout";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import type { EventFinisherInput } from "./analyzeFinishFunnel";

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
const finisherSpacingInput =
  document.querySelector<HTMLInputElement>("#finisher-spacing")!;
const decelerationZoneInput =
  document.querySelector<HTMLInputElement>("#deceleration-zone")!;
const laneCountInput = document.querySelector<HTMLInputElement>("#lane-count")!;
const laneLengthInput =
  document.querySelector<HTMLInputElement>("#lane-length")!;
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
const queuePaginationMount = document.querySelector<HTMLDivElement>(
  "#queue-pagination-mount",
)!;
const queueVisualisationPanel = document.querySelector<HTMLElement>(
  "#queue-visualisation-panel",
)!;

for (const fixture of fixtures) {
  const option = document.createElement("option");
  option.value = fixture.id;
  option.textContent = `${fixture.eventName} #${fixture.eventNumber}`;
  eventSelect.append(option);
}
eventSelect.value = DEFAULT_FIXTURE_ID;

let selectedMomentSeconds = 0;
let simulationStateKey = "";
let chartTimeRange: ChartTimeRange = { minTimeSeconds: 0, maxTimeSeconds: 0 };
let queuePageIndex = 0;
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

function readLaneLengthMetres(): number {
  return readNumberInput(laneLengthInput, 30);
}

function readFinisherSpacingMetres(): number {
  return finisherSpacingMetresFromInput({
    rawValue: finisherSpacingInput.value,
    fallback: DEFAULT_FINISHER_SPACING_METRES,
    laneLengthMetres: readLaneLengthMetres(),
    decelerationZoneMetres: readDecelerationZoneMetres(),
  });
}

function syncFinisherSpacingInput(): void {
  const laneLengthMetres = readLaneLengthMetres();
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

function applyFixtureLayoutDefaults(fixtureId: string): void {
  const defaults = fixtureLayoutDefaults(fixtureId);
  laneCountInput.value = String(defaults.laneCount);
  laneLengthInput.value = String(defaults.laneLengthMetres);
}

function currentSimulationStateKey(fixtureId: string): string {
  return JSON.stringify({
    fixtureId,
    tokensPerMinutePerVolunteer: readNumberInput(tokensPerMinuteInput, 15),
    volunteerCount: readNumberInput(volunteerCountInput, 1),
    finisherSpacingMetres: readFinisherSpacingMetres(),
    decelerationZoneMetres: readDecelerationZoneMetres(),
  });
}

function renderQueueVisualisation(
  fixture: EventFixture,
  finishTokensSettings: {
    tokensPerMinutePerVolunteer: number;
    volunteerCount: number;
  },
  layout: {
    laneCount: number;
    laneLengthMetres: number;
    decelerationZoneMetres: number;
    finisherSpacingMetres: number;
  },
): void {
  const searchFilter = parseQueueSearchFilter(queueSearchInput.value);
  const queueResult = queuedFinishersAtMoment({
    finishers: fixture.finishers,
    finishTokensSettings,
    momentSeconds: selectedMomentSeconds,
    offset: queuePageIndex * QUEUE_PAGE_SIZE,
    limit: QUEUE_PAGE_SIZE,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres: layout.decelerationZoneMetres,
    finisherSpacingMetres: layout.finisherSpacingMetres,
    ...searchFilter,
  });
  const pageCount = queuePageCount(queueResult.totalCount, QUEUE_PAGE_SIZE);

  if (queuePageIndex >= pageCount) {
    queuePageIndex = Math.max(0, pageCount - 1);
    renderQueueVisualisation(fixture, finishTokensSettings, layout);
    return;
  }

  queueMomentHeadingElement.textContent = queueMomentHeading(
    queueResult.queueDepth,
  );
  queueSummaryMount.innerHTML = buildQueueMomentSummaryMarkup(
    queueResult.queueMomentSummary,
  );
  queueTableMount.innerHTML = buildQueueTableMarkup(queueResult.finishers);
  queuePaginationMount.innerHTML = buildQueuePaginationMarkup({
    pageIndex: queuePageIndex,
    pageCount,
    pageSize: QUEUE_PAGE_SIZE,
    totalCount: queueResult.totalCount,
  });
}

function render(resetSelectedMoment = false, resetQueuePage = false): void {
  syncFinisherSpacingInput();

  const fixture = selectedFixture();
  const finishTokensSettings = {
    tokensPerMinutePerVolunteer: readNumberInput(tokensPerMinuteInput, 15),
    volunteerCount: readNumberInput(volunteerCountInput, 1),
  };
  const finisherSpacingMetres = readFinisherSpacingMetres();
  const decelerationZoneMetres = readDecelerationZoneMetres();
  const laneCount = readNumberInput(laneCountInput, 1);
  const laneLengthMetres = readLaneLengthMetres();
  const nextSimulationStateKey = currentSimulationStateKey(fixture.id);

  if (resetSelectedMoment || nextSimulationStateKey !== simulationStateKey) {
    queuePageIndex = 0;
  } else if (resetQueuePage) {
    queuePageIndex = 0;
  }

  const result = analyzeFinishFunnel({
    finishers: fixture.finishers,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
    laneCount,
    laneLengthMetres,
  });

  chartTimeRange = timeRangeFromChartPoints(result.queueDepthOverTime);
  batchMarkerMoments = result.batchMarkerMoments;
  const peakMoment = firstMomentAtPeakQueueDepth(
    result.queueDepthOverTime,
    result.peakQueueDepth,
  );

  if (resetSelectedMoment || nextSimulationStateKey !== simulationStateKey) {
    selectedMomentSeconds = peakMoment;
    simulationStateKey = nextSimulationStateKey;
  }

  selectedMomentSeconds = clampSelectedMoment(
    selectedMomentSeconds,
    chartTimeRange,
  );

  const proposedMultiLaneLayout = result.proposedMultiLaneLayout ?? {
    sufficient: true,
    combinedLaneCapacity: 0,
    headroomFinishers: 0,
    shortfallFinishers: 0,
    minimumLanesRequired: 0,
  };

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
    proposedMultiLaneLayout,
    finishLineBackupDelays: result.finishLineBackupDelays,
  });

  chartSelectedMoment.textContent = `Selected moment: ${formatFinishClockTime(selectedMomentSeconds)}`;

  drawQueueDepthChart(chartCanvas, result.queueDepthOverTime, {
    peakQueueDepth: result.peakQueueDepth,
    proposedQueueCapacity: proposedMultiLaneLayout.combinedLaneCapacity,
    selectedMomentSeconds,
    batchMarkerMoments,
  });

  renderQueueVisualisation(fixture, finishTokensSettings, {
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
}

for (const element of [
  tokensPerMinuteInput,
  volunteerCountInput,
  finisherSpacingInput,
  decelerationZoneInput,
]) {
  element.addEventListener("input", () => render(true));
}
for (const element of [laneCountInput, laneLengthInput]) {
  element.addEventListener("input", () => render());
}
eventSelect.addEventListener("change", () => {
  applyFixtureLayoutDefaults(eventSelect.value);
  render(true);
});
queueSearchInput.addEventListener("input", () => render(false, true));

queueVisualisationPanel.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.id === "queue-prev-page") {
    queuePageIndex = Math.max(0, queuePageIndex - 1);
    render();
  }

  if (target.id === "queue-next-page") {
    queuePageIndex += 1;
    render();
  }
});

attachCanvasResizeHandler(chartWrap, () => render());
attachChartMomentControls({
  canvas: chartCanvas,
  getRange: () => chartTimeRange,
  getMoment: () => selectedMomentSeconds,
  getBatchMarkerMoments: () => batchMarkerMoments,
  onMomentChange: (momentSeconds) => {
    selectedMomentSeconds = momentSeconds;
    queuePageIndex = 0;
    render();
  },
});

render(true);
