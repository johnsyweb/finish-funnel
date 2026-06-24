import { describe, expect, it } from "vitest";
import { DEFAULT_FINISH_TOKENS_SETTINGS } from "../defaults";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";
import { runFinishFunnelSimulation } from "../runFinishFunnelSimulation";
import { parseResultsHtml } from "../parseResultsHtml";

describe("runFinishFunnelSimulation", () => {
  it("resyncs layout to model recommendation when simulation settings change", () => {
    const finishers = parseResultsHtml(`
      <table class="Results-table js-ResultsTable">
        <tr class="Results-table-row" data-position="1" data-name="Alex SMITH">
          <td class="Results-table-td Results-table-td--time"><div class="compact">18:30</div></td>
        </tr>
        <tr class="Results-table-row" data-position="2" data-name="Sam JONES">
          <td class="Results-table-td Results-table-td--time"><div class="compact">18:30</div></td>
        </tr>
        <tr class="Results-table-row" data-position="3" data-name="Pat LEE">
          <td class="Results-table-td Results-table-td--time"><div class="compact">18:31</div></td>
        </tr>
      </table>
    `);

    const initial = runFinishFunnelSimulation({
      finishers,
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      layoutRaw: { laneCount: 1, laneLengthMetres: 30 },
      finisherSpacingRaw: "0.75",
      previousSettingsStateKey: "",
    });

    const widerSite = runFinishFunnelSimulation({
      finishers,
      persisted: {
        ...DEFAULT_PERSISTED_EVENT_SETTINGS,
        maximumLaneCount: 2,
        maximumLaneLengthMetres: 200,
      },
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      layoutRaw: initial.layout,
      finisherSpacingRaw: "0.75",
      previousSettingsStateKey: initial.settingsStateKey,
    });

    expect(widerSite.layoutResynced).toBe(true);
    expect(widerSite.layout.laneCount).toBeGreaterThanOrEqual(1);
    expect(widerSite.layout.laneLengthMetres).toBeLessThanOrEqual(200);
  });
});
