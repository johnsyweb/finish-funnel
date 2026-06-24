import type { PersistedEventSettings } from "../persistedEventSettings";
import { USERSCRIPT_PANEL_INPUT_IDS as ids } from "./userscriptPanelInputIds";

function finishTokensFieldset({
  persisted,
  volunteerCount,
  fetchDelayOverridden,
}: {
  persisted: PersistedEventSettings;
  volunteerCount: number;
  fetchDelayOverridden: boolean;
}): string {
  const fetchDelayAttributes = fetchDelayOverridden
    ? 'readonly aria-readonly="true"'
    : "";

  return `<fieldset class="finish-funnel-fieldset">
      <legend>Finish Tokens</legend>
      <div class="finish-funnel-field">
        <label for="${ids.tokensPerMinute}">Tokens per minute (active volunteer)</label>
        <input id="${ids.tokensPerMinute}" type="number" min="1" step="1" value="${persisted.tokensPerMinutePerVolunteer}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.volunteerCount}">Finish Tokens volunteers in rotation</label>
        <input id="${ids.volunteerCount}" type="number" min="1" step="1" value="${volunteerCount}" readonly aria-readonly="true" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.tokenSupplyBatchSize}">Token supply batch size</label>
        <input id="${ids.tokenSupplyBatchSize}" type="number" min="1" step="1" value="${persisted.tokenSupplyBatchSize}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.tokenSupplyFetchDelay}">Token supply fetch delay (s)</label>
        <input id="${ids.tokenSupplyFetchDelay}" type="number" min="0" step="1" value="${fetchDelayOverridden ? 0 : persisted.tokenSupplyFetchDelaySeconds}" ${fetchDelayAttributes} />
      </div>
    </fieldset>`;
}

function siteConstraintsFieldset(persisted: PersistedEventSettings): string {
  return `<fieldset class="finish-funnel-fieldset">
      <legend>Site constraints</legend>
      <div class="finish-funnel-field">
        <label for="${ids.maximumLaneLength}">Maximum lane length (m)</label>
        <input id="${ids.maximumLaneLength}" type="number" min="0" step="1" value="${persisted.maximumLaneLengthMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.maximumLaneCount}">Maximum lane count</label>
        <input id="${ids.maximumLaneCount}" type="number" min="1" step="1" value="${persisted.maximumLaneCount}" />
      </div>
    </fieldset>`;
}

function layoutAssumptionsFieldset(persisted: PersistedEventSettings): string {
  return `<fieldset class="finish-funnel-fieldset">
      <legend>Layout assumptions</legend>
      <div class="finish-funnel-field">
        <label for="${ids.decelerationZone}">Deceleration zone (m)</label>
        <input id="${ids.decelerationZone}" type="number" min="0" step="0.5" value="${persisted.decelerationZoneMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.finisherSpacing}">Finisher spacing (m)</label>
        <input id="${ids.finisherSpacing}" type="number" min="0.25" step="0.05" value="${persisted.finisherSpacingMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.cordonStakeSpacing}">Cordon stake spacing (m)</label>
        <input id="${ids.cordonStakeSpacing}" type="number" min="1" step="1" value="${persisted.cordonStakeSpacingMetres}" />
      </div>
    </fieldset>`;
}

function layoutFieldset(layout: {
  laneCount: number;
  laneLengthMetres: number;
}): string {
  return `<fieldset class="finish-funnel-fieldset">
      <legend>Layout</legend>
      <div class="finish-funnel-field">
        <label for="${ids.layoutLaneLength}">Lane length (m)</label>
        <input id="${ids.layoutLaneLength}" type="number" min="0" step="1" value="${layout.laneLengthMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${ids.layoutLaneCount}">Lane count</label>
        <input id="${ids.layoutLaneCount}" type="number" min="1" step="1" value="${layout.laneCount}" />
      </div>
      <div class="finish-funnel-field">
        <button type="button" id="${ids.resetToModelRecommendation}" hidden>Reset to model recommendation</button>
      </div>
    </fieldset>`;
}

export function buildUserscriptSettingsMarkup({
  persisted,
  layout,
  volunteerCount,
  fetchDelayOverridden,
}: {
  persisted: PersistedEventSettings;
  layout: { laneCount: number; laneLengthMetres: number };
  volunteerCount: number;
  fetchDelayOverridden: boolean;
}): string {
  return `<section class="finish-funnel-panel-section" id="finish-funnel-settings" aria-labelledby="finish-funnel-settings-heading">
  <h3 id="finish-funnel-settings-heading">Settings</h3>
  <div class="finish-funnel-settings-row">
    ${finishTokensFieldset({ persisted, volunteerCount, fetchDelayOverridden })}
    ${siteConstraintsFieldset(persisted)}
  </div>
  <div class="finish-funnel-settings-row">
    ${layoutAssumptionsFieldset(persisted)}
    ${layoutFieldset(layout)}
  </div>
</section>`;
}
