// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";
import { buildFinishFunnelPanelMarkup } from "../userscript/buildFinishFunnelPanelMarkup";
import { runFinishFunnelSimulation } from "../runFinishFunnelSimulation";
import { DEFAULT_FINISH_TOKENS_SETTINGS } from "../defaults";
import { parseResultsHtml } from "../parseResultsHtml";
import { USERSCRIPT_PANEL_INPUT_IDS as ids } from "../userscript/userscriptPanelInputIds";

describe("layout changes preserve layout assumptions", () => {
  it("does not clamp finisher spacing input when only layout lane length changes", () => {
    const finishers = parseResultsHtml(`
      <table class="Results-table js-ResultsTable">
        <tr class="Results-table-row" data-position="1" data-name="Alex SMITH">
          <td class="Results-table-td Results-table-td--time"><div class="compact">18:30</div></td>
        </tr>
      </table>
    `);

    const persisted = {
      ...DEFAULT_PERSISTED_EVENT_SETTINGS,
      finisherSpacingMetres: 0.75,
      decelerationZoneMetres: 5,
    };

    const initial = runFinishFunnelSimulation({
      finishers,
      persisted,
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      layoutRaw: { laneCount: 1, laneLengthMetres: 30 },
      finisherSpacingRaw: "0.75",
      previousSettingsStateKey: "",
    });

    const afterShorterLane = runFinishFunnelSimulation({
      finishers,
      persisted,
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      layoutRaw: { laneCount: 1, laneLengthMetres: 5 },
      finisherSpacingRaw: "0.75",
      previousSettingsStateKey: initial.settingsStateKey,
    });

    expect(afterShorterLane.layoutResynced).toBe(false);
    expect(afterShorterLane.syncedFinisherSpacing.value).toBe("0.25");

    const panel = document.createElement("section");
    panel.innerHTML = buildFinishFunnelPanelMarkup({
      persisted,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      volunteerCount: 1,
      fetchDelayOverridden: false,
    });

    const finisherSpacingInput = panel.querySelector<HTMLInputElement>(
      `#${ids.finisherSpacing}`,
    );
    expect(finisherSpacingInput?.value).toBe("0.75");

    finisherSpacingInput!.max = afterShorterLane.syncedFinisherSpacing.max;

    expect(finisherSpacingInput?.value).toBe("0.75");
    expect(finisherSpacingInput?.max).toBe(
      afterShorterLane.syncedFinisherSpacing.max,
    );
  });
});
