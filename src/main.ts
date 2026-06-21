import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { attachCanvasResizeHandler } from "./attachCanvasResizeHandler";
import { buildAppMarkup } from "./buildAppMarkup";
import { proposedFunnelQueueCapacity } from "./checkProposedFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FIXTURE_ID,
} from "./defaults";
import { drawQueueDepthChart } from "./drawQueueDepthChart";
import { orderFixturesForDisplay } from "./orderFixturesForDisplay";
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
const chartCanvas = document.querySelector<HTMLCanvasElement>("#queue-chart")!;
const chartWrap = document.querySelector<HTMLElement>("#chart-wrap")!;

for (const fixture of fixtures) {
  const option = document.createElement("option");
  option.value = fixture.id;
  option.textContent = `${fixture.eventName} #${fixture.eventNumber}`;
  eventSelect.append(option);
}
eventSelect.value = DEFAULT_FIXTURE_ID;

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

function render(): void {
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

  const result = analyzeFinishFunnel({
    finishers: fixture.finishers,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
    proposedFunnelMetres,
  });

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

  drawQueueDepthChart(chartCanvas, result.queueDepthOverTime, {
    peakQueueDepth: result.peakQueueDepth,
    proposedQueueCapacity,
  });
}

for (const element of [
  tokensPerMinuteInput,
  volunteerCountInput,
  finisherSpacingInput,
  decelerationZoneInput,
  proposedFunnelInput,
]) {
  element.addEventListener("input", render);
}
eventSelect.addEventListener("change", render);

attachCanvasResizeHandler(chartWrap, render);

render();
