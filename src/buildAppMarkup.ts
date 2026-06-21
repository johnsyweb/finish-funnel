import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FIXTURE_ID,
} from "./defaults";
import { fixtureLayoutDefaults } from "./fixtureLayoutDefaults";

const defaultLayout = fixtureLayoutDefaults(DEFAULT_FIXTURE_ID);

export function buildAppMarkup(): string {
  return `
  <a class="skip-link" href="#main-controls">Skip to settings</a>

  <header>
    <h1>Finish Funnel</h1>
    <p>Size a finish funnel so Finish Tokens can be handed out in position order.</p>
  </header>

  <div id="main-controls">
    <section class="panel">
      <fieldset>
        <legend>Event</legend>
        <div class="field">
          <label for="event-select">Results fixture</label>
          <select id="event-select"></select>
        </div>
      </fieldset>
    </section>

    <section class="panel grid two">
      <fieldset>
        <legend>Finish Tokens</legend>
        <div class="field">
          <label for="tokens-per-minute">Tokens per minute per volunteer</label>
          <input id="tokens-per-minute" type="number" min="1" step="1" value="${DEFAULT_FINISH_TOKENS_SETTINGS.tokensPerMinutePerVolunteer}" />
        </div>
        <div class="field">
          <label for="volunteer-count">Finish Tokens volunteers</label>
          <input id="volunteer-count" type="number" min="1" step="1" value="${DEFAULT_FINISH_TOKENS_SETTINGS.volunteerCount}" />
        </div>
      </fieldset>
      <fieldset>
        <legend>Layout</legend>
        <div class="field">
          <label for="finisher-spacing">Finisher spacing (m)</label>
          <input id="finisher-spacing" type="number" min="0.25" step="0.05" value="${DEFAULT_FINISHER_SPACING_METRES}" />
        </div>
        <div class="field">
          <label for="deceleration-zone">Deceleration zone (m)</label>
          <input id="deceleration-zone" type="number" min="0" step="0.5" value="${DEFAULT_DECELERATION_ZONE_METRES}" />
        </div>
        <div class="field">
          <label for="lane-count">Lane count</label>
          <input id="lane-count" type="number" min="1" step="1" value="${defaultLayout.laneCount}" />
        </div>
        <div class="field">
          <label for="lane-length">Lane length (m)</label>
          <input id="lane-length" type="number" min="0" step="1" value="${defaultLayout.laneLengthMetres}" />
        </div>
      </fieldset>
    </section>
  </div>

  <div id="callout" role="status" aria-live="polite" hidden></div>

  <section class="panel metrics" id="metrics" aria-live="polite" aria-atomic="true"></section>

  <section class="panel">
    <h2>Queue depth over finish time</h2>
    <p id="chart-selected-moment" class="chart-selected-moment" aria-live="polite"></p>
    <div class="chart-wrap" id="chart-wrap">
      <canvas
        id="queue-chart"
        tabindex="0"
        role="img"
        aria-label="Queue depth over finish time. Click or drag to choose a moment; use arrow keys when focused; use Page Up and Page Down to jump between batch marker moments."
      ></canvas>
    </div>
  </section>

  <section class="panel" id="queue-visualisation-panel">
    <h2>Queue at selected moment</h2>
    <div id="queue-summary-mount" aria-live="polite"></div>
    <div class="field">
      <label for="queue-search">Search by name or finish position</label>
      <input id="queue-search" type="search" autocomplete="off" />
    </div>
    <div id="queue-table-mount"></div>
    <div id="queue-pagination-mount"></div>
  </section>
`;
}
