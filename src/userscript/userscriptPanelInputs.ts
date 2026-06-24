import {
  DEFAULT_CORDON_STAKE_SPACING_METRES,
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";
import type { PersistedEventSettings } from "../persistedEventSettings";
import { readNumberInput } from "../readNumberInput";
import { USERSCRIPT_PANEL_INPUT_IDS as ids } from "./userscriptPanelInputIds";

export type UserscriptPanelInputs = {
  persisted: PersistedEventSettings;
  layoutRaw: { laneCount: number; laneLengthMetres: number };
  finisherSpacingRaw: string;
};

function input(panel: ParentNode, id: string): HTMLInputElement {
  const element = panel.querySelector<HTMLInputElement>(`#${id}`);
  if (!element) {
    throw new Error(`Userscript panel input not found: ${id}`);
  }
  return element;
}

export function readUserscriptPanelInputs(
  panel: ParentNode,
): UserscriptPanelInputs {
  const tokensPerMinute = readNumberInput(
    input(panel, ids.tokensPerMinute),
    DEFAULT_FINISH_TOKENS_SETTINGS.tokensPerMinutePerVolunteer,
  );
  const tokenSupplyBatchSize = readNumberInput(
    input(panel, ids.tokenSupplyBatchSize),
    DEFAULT_FINISH_TOKENS_SETTINGS.tokenSupplyBatchSize,
  );
  const tokenSupplyFetchDelaySeconds = readNumberInput(
    input(panel, ids.tokenSupplyFetchDelay),
    DEFAULT_FINISH_TOKENS_SETTINGS.tokenSupplyFetchDelaySeconds,
  );
  const maximumLaneLengthMetres = readNumberInput(
    input(panel, ids.maximumLaneLength),
    30,
  );
  const maximumLaneCount = readNumberInput(
    input(panel, ids.maximumLaneCount),
    1,
  );
  const decelerationZoneMetres = readNumberInput(
    input(panel, ids.decelerationZone),
    DEFAULT_DECELERATION_ZONE_METRES,
  );
  const finisherSpacingMetres = readNumberInput(
    input(panel, ids.finisherSpacing),
    DEFAULT_FINISHER_SPACING_METRES,
  );
  const cordonStakeSpacingMetres = Math.max(
    1,
    readNumberInput(
      input(panel, ids.cordonStakeSpacing),
      DEFAULT_CORDON_STAKE_SPACING_METRES,
    ),
  );

  return {
    persisted: {
      tokensPerMinutePerVolunteer: tokensPerMinute,
      tokenSupplyBatchSize,
      tokenSupplyFetchDelaySeconds,
      maximumLaneLengthMetres,
      maximumLaneCount,
      decelerationZoneMetres,
      finisherSpacingMetres,
      cordonStakeSpacingMetres,
    },
    layoutRaw: {
      laneCount: readNumberInput(input(panel, ids.layoutLaneCount), 1),
      laneLengthMetres: readNumberInput(input(panel, ids.layoutLaneLength), 30),
    },
    finisherSpacingRaw: input(panel, ids.finisherSpacing).value,
  };
}

export function writeUserscriptPanelLayout(
  panel: ParentNode,
  layout: { laneCount: number; laneLengthMetres: number },
): void {
  input(panel, ids.layoutLaneCount).value = String(layout.laneCount);
  input(panel, ids.layoutLaneLength).value = String(layout.laneLengthMetres);
}

export function writeUserscriptPanelFinisherSpacing(
  panel: ParentNode,
  synced: { value: string; max: string },
): void {
  const finisherSpacingInput = input(panel, ids.finisherSpacing);
  finisherSpacingInput.max = synced.max;
  finisherSpacingInput.value = synced.value;
}

export function setUserscriptPanelResetButtonVisible(
  panel: ParentNode,
  visible: boolean,
): void {
  const button = panel.querySelector<HTMLButtonElement>(
    `#${ids.resetToModelRecommendation}`,
  );
  if (button) {
    button.hidden = !visible;
  }
}

export function writeUserscriptPanelFinisherSpacingMax(
  panel: ParentNode,
  max: string,
): void {
  input(panel, ids.finisherSpacing).max = max;
}

export function writeUserscriptPanelVolunteerCount(
  panel: ParentNode,
  volunteerCount: number,
): void {
  input(panel, ids.volunteerCount).value = String(volunteerCount);
}

export function writeUserscriptPanelFetchDelay(
  panel: ParentNode,
  {
    seconds,
    overridden,
  }: {
    seconds: number;
    overridden: boolean;
  },
): void {
  const fetchDelayInput = input(panel, ids.tokenSupplyFetchDelay);
  fetchDelayInput.value = String(seconds);
  fetchDelayInput.readOnly = overridden;
  if (overridden) {
    fetchDelayInput.setAttribute("aria-readonly", "true");
  } else {
    fetchDelayInput.removeAttribute("aria-readonly");
  }
}
