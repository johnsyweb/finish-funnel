import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { attachCanvasResizeHandler } from "./attachCanvasResizeHandler";
import { attachChartMomentControls } from "./attachChartMomentControls";
import { buildAppMarkup } from "./buildAppMarkup";
import {
  buildQueuePaginationMarkup,
  buildQueueSummaryMarkup,
  buildQueueTableMarkup,
  parseQueueSearchFilter,
  QUEUE_PAGE_SIZE,
  queuePageCount,
} from "./buildQueueVisualisationMarkup";
import {
  clampSelectedMoment,
  timeRangeFromChartPoints,
  type ChartTimeRange,
} from "./chartMomentMapping";
import { proposedFunnelQueueCapacity } from "./checkProposedFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FIXTURE_ID,
} from "./defaults";
import { drawQueueDepthChart } from "./drawQueueDepthChart";
import { formatFinishClockTime } from "./formatFinishClockTime";
import { orderFixturesForDisplay } from "./orderFixturesForDisplay";
import {
  firstMomentAtPeakQueueDepth,
  queuedFinishersAtMoment,
} from "./queuedFinishersAtMoment";
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
const proposedFunnelInput =
  document.querySelector<HTMLInputElement>("#proposed-funnel")!;
const callout = document.querySelector<HTMLDivElement>("#callout")!;
const metrics = document.querySelector<HTMLDivElement>("#metrics")!;
const chartSelectedMoment = document.querySelector<HTMLParagraphElement>(
  "#chart-selected-moment",
)!;
const chartCanvas = document.querySelector<HTMLCanvasElement>("#queue-chart")!;
const chartWrap = document.querySelector<HTMLElement>("#chart-wrap")!;
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

function readNumberInput(input: HTMLInputElement, fallback: number): number {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function selectedFixture(): EventFixture {
  const fixture = fixtures.find((entry) => entry.id === eventSelect.value);
  if (!fixture) {
    throw new Error("Fixture not found");
  }
  return fixture;
}

function currentSimulationStateKey(fixtureId: string): string {
  return JSON.stringify({
    fixtureId,
    tokensPerMinutePerVolunteer: readNumberInput(tokensPerMinuteInput, 15),
    volunteerCount: readNumberInput(volunteerCountInput, 1),
    finisherSpacingMetres: readNumberInput(
      finisherSpacingInput,
      DEFAULT_FINISHER_SPACING_METRES,
    ),
    decelerationZoneMetres: readNumberInput(
      decelerationZoneInput,
      DEFAULT_DECELERATION_ZONE_METRES,
    ),
  });
}

function renderQueueVisualisation(
  fixture: EventFixture,
  finishTokensSettings: {
    tokensPerMinutePerVolunteer: number;
    volunteerCount: number;
  },
): void {
  const searchFilter = parseQueueSearchFilter(queueSearchInput.value);
  const queueResult = queuedFinishersAtMoment({
    finishers: fixture.finishers,
    finishTokensSettings,
    momentSeconds: selectedMomentSeconds,
    offset: queuePageIndex * QUEUE_PAGE_SIZE,
    limit: QUEUE_PAGE_SIZE,
    ...searchFilter,
  });
  const pageCount = queuePageCount(queueResult.totalCount, QUEUE_PAGE_SIZE);

  if (queuePageIndex >= pageCount) {
    queuePageIndex = Math.max(0, pageCount - 1);
    renderQueueVisualisation(fixture, finishTokensSettings);
    return;
  }

  queueSummaryMount.innerHTML = buildQueueSummaryMarkup(queueResult.queueDepth);
  queueTableMount.innerHTML = buildQueueTableMarkup(queueResult.finishers);
  queuePaginationMount.innerHTML = buildQueuePaginationMarkup({
    pageIndex: queuePageIndex,
    pageCount,
    pageSize: QUEUE_PAGE_SIZE,
    totalCount: queueResult.totalCount,
  });
}

function render(resetSelectedMoment = false, resetQueuePage = false): void {
  const fixture = selectedFixture();
  const finishTokensSettings = {
    tokensPerMinutePerVolunteer: readNumberInput(tokensPerMinuteInput, 15),
    volunteerCount: readNumberInput(volunteerCountInput, 1),
  };
  const finisherSpacingMetres = readNumberInput(
    finisherSpacingInput,
    DEFAULT_FINISHER_SPACING_METRES,
  );
  const decelerationZoneMetres = readNumberInput(
    decelerationZoneInput,
    DEFAULT_DECELERATION_ZONE_METRES,
  );
  const proposedFunnelMetres = readNumberInput(proposedFunnelInput, 30);
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
    proposedFunnelMetres,
  });

  chartTimeRange = timeRangeFromChartPoints(result.queueDepthOverTime);
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

  if (result.funnelNotRequired) {
    callout.hidden = false;
    callout.className = "callout";
    callout.textContent =
      "A roped-off funnel may not be needed for this event.";
  } else {
    callout.hidden = true;
  }

  const proposedQueueCapacity = proposedFunnelQueueCapacity({
    proposedMetres: proposedFunnelMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const adequacy = result.proposedFunnel;
  const adequacyText = adequacy
    ? adequacy.sufficient
      ? `Sufficient (${adequacy.headroomFinishers} finisher headroom)`
      : `Short by ${adequacy.shortfallFinishers} finishers`
    : "";

  metrics.innerHTML = `
    <div class="metric">
      <span>Peak queue capacity</span>
      <strong>${result.peakQueueDepth}</strong>
      finishers
    </div>
    <div class="metric">
      <span>Recommended funnel length</span>
      <strong>${result.recommendedLengthMetres} m</strong>
      rounded up
    </div>
    <div class="metric">
      <span>Proposed funnel capacity</span>
      <strong>${proposedQueueCapacity}</strong>
      finishers in queue zone
    </div>
    <div class="metric adequacy ${adequacy?.sufficient ? "ok" : "bad"}">
      <span>Proposed funnel</span>
      <strong>${adequacyText}</strong>
    </div>
  `;

  chartSelectedMoment.textContent = `Selected moment: ${formatFinishClockTime(selectedMomentSeconds)}`;

  drawQueueDepthChart(chartCanvas, result.queueDepthOverTime, {
    peakQueueDepth: result.peakQueueDepth,
    proposedQueueCapacity,
    selectedMomentSeconds,
  });

  renderQueueVisualisation(fixture, finishTokensSettings);
}

for (const element of [
  tokensPerMinuteInput,
  volunteerCountInput,
  finisherSpacingInput,
  decelerationZoneInput,
]) {
  element.addEventListener("input", () => render(true));
}
eventSelect.addEventListener("change", () => render(true));
proposedFunnelInput.addEventListener("input", () => render());
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
  onMomentChange: (momentSeconds) => {
    selectedMomentSeconds = momentSeconds;
    queuePageIndex = 0;
    render();
  },
});

render(true);
