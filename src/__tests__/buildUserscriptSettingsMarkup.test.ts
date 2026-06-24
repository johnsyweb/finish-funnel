// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildUserscriptSettingsMarkup } from "../userscript/buildUserscriptSettingsMarkup";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";

describe("buildUserscriptSettingsMarkup", () => {
  it("pairs site constraints with finish tokens and layout with layout assumptions", () => {
    const markup = buildUserscriptSettingsMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 2, laneLengthMetres: 80 },
      volunteerCount: 1,
      fetchDelayOverridden: false,
    });

    const document = new DOMParser().parseFromString(markup, "text/html");
    const rows = document.querySelectorAll(".finish-funnel-settings-row");

    expect(rows).toHaveLength(2);
    expect(rows[0]?.querySelector("legend")?.textContent).toBe("Finish Tokens");
    expect(rows[0]?.querySelectorAll("legend")[1]?.textContent).toBe(
      "Site constraints",
    );
    expect(rows[1]?.querySelector("legend")?.textContent).toBe(
      "Layout assumptions",
    );
    expect(rows[1]?.querySelectorAll("legend")[1]?.textContent).toBe("Layout");
  });

  it("associates every settings input with a visible label", () => {
    const markup = buildUserscriptSettingsMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      volunteerCount: 2,
      fetchDelayOverridden: true,
    });
    const document = new DOMParser().parseFromString(markup, "text/html");
    const labelledInputs = document.querySelectorAll("input[id]");

    for (const input of labelledInputs) {
      const id = input.getAttribute("id");
      expect(document.querySelector(`label[for="${id}"]`)).not.toBeNull();
    }
  });

  it("lists lane length before lane count in layout and site constraints", () => {
    const markup = buildUserscriptSettingsMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 2, laneLengthMetres: 80 },
      volunteerCount: 1,
      fetchDelayOverridden: false,
    });

    const document = new DOMParser().parseFromString(markup, "text/html");
    const siteConstraints = [...document.querySelectorAll("fieldset")].find(
      (fieldset) =>
        fieldset.querySelector("legend")?.textContent === "Site constraints",
    );
    const layout = [...document.querySelectorAll("fieldset")].find(
      (fieldset) => fieldset.querySelector("legend")?.textContent === "Layout",
    );

    expect(siteConstraints?.querySelector("label")?.textContent).toContain(
      "Maximum lane length",
    );
    expect(
      siteConstraints?.querySelectorAll("label")[1]?.textContent,
    ).toContain("Maximum lane count");
    expect(layout?.querySelector("label")?.textContent).toContain(
      "Lane length",
    );
    expect(layout?.querySelectorAll("label")[1]?.textContent).toContain(
      "Lane count",
    );
  });
});
