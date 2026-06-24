// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildFinishFunnelPanelMarkup } from "../userscript/buildFinishFunnelPanelMarkup";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";
import {
  readUserscriptPanelInputs,
  writeUserscriptPanelLayout,
} from "../userscript/userscriptPanelInputs";
import { USERSCRIPT_PANEL_INPUT_IDS as ids } from "../userscript/userscriptPanelInputIds";

describe("userscriptPanelInputs", () => {
  it("reads persisted settings and layout from panel inputs", () => {
    const panel = document.createElement("section");
    panel.innerHTML = buildFinishFunnelPanelMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 2, laneLengthMetres: 80 },
      volunteerCount: 3,
      fetchDelayOverridden: true,
    });

    const inputs = readUserscriptPanelInputs(panel);

    expect(inputs.persisted.maximumLaneCount).toBe(1);
    expect(inputs.layoutRaw).toEqual({ laneCount: 2, laneLengthMetres: 80 });
    expect(
      panel.querySelector<HTMLInputElement>(`#${ids.tokenSupplyFetchDelay}`)
        ?.readOnly,
    ).toBe(true);
  });

  it("writes layout values back to panel inputs", () => {
    const panel = document.createElement("section");
    panel.innerHTML = buildFinishFunnelPanelMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      volunteerCount: 1,
      fetchDelayOverridden: false,
    });

    writeUserscriptPanelLayout(panel, { laneCount: 3, laneLengthMetres: 120 });

    expect(
      panel.querySelector<HTMLInputElement>(`#${ids.layoutLaneCount}`)?.value,
    ).toBe("3");
    expect(
      panel.querySelector<HTMLInputElement>(`#${ids.layoutLaneLength}`)?.value,
    ).toBe("120");
  });
});
