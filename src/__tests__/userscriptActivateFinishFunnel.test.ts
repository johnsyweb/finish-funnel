// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { finishFunnelColumnMarkupByPosition } from "../buildFinishFunnelColumnMarkup";
import {
  activateFinishFunnelOnDocument,
  activateFinishFunnelWithPersistedSettings,
  deactivateFinishFunnelOnDocument,
  mountFinishFunnelUserscript,
} from "../userscript/activateFinishFunnel";
import { parseResultsFromDocument } from "../parseResultsFromDocument";
import { parseResultsHtml } from "../parseResultsHtml";
import {
  DEFAULT_PERSISTED_EVENT_SETTINGS,
  savePersistedEventSettings,
} from "../persistedEventSettings";
import { persistedEventSettingsStorageKey } from "../eventPathFromResultsPageUrl";

const sampleResultsHtml = `
<table class="Results-table Results-table--compact js-ResultsTable">
  <thead>
    <tr class="Results-table-thead">
      <th class="Results-table-th Results-table-th--position">Position</th>
      <th class="Results-table-th Results-table-th--name">parkrunner</th>
      <th class="Results-table-th Results-table-th--gender">Gender</th>
      <th class="Results-table-th Results-table-th--ageGroup">Age Group</th>
      <th class="Results-table-th Results-table-th--club">Group</th>
      <th class="Results-table-th Results-table-th--time">Time</th>
    </tr>
  </thead>
  <tbody class="js-ResultsTbody">
    <tr class="Results-table-row" data-name="Alex SMITH" data-position="1">
      <td class="Results-table-td Results-table-td--position">1</td>
      <td class="Results-table-td Results-table-td--name"><div class="compact">Alex SMITH</div></td>
      <td class="Results-table-td Results-table-td--gender"><div class="compact">Male</div></td>
      <td class="Results-table-td Results-table-td--ageGroup"><div class="compact">SM30-34</div></td>
      <td class="Results-table-td Results-table-td--club"><div class="compact"></div></td>
      <td class="Results-table-td Results-table-td--time"><div class="compact">18:30</div></td>
    </tr>
    <tr class="Results-table-row" data-name="Sam JONES" data-position="2">
      <td class="Results-table-td Results-table-td--position">2</td>
      <td class="Results-table-td Results-table-td--name"><div class="compact">Sam JONES</div></td>
      <td class="Results-table-td Results-table-td--gender"><div class="compact">Male</div></td>
      <td class="Results-table-td Results-table-td--ageGroup"><div class="compact">SM30-34</div></td>
      <td class="Results-table-td Results-table-td--club"><div class="compact"></div></td>
      <td class="Results-table-td Results-table-td--time"><div class="compact">18:30</div></td>
    </tr>
    <tr class="Results-table-row" data-name="Pat LEE" data-position="3">
      <td class="Results-table-td Results-table-td--position">3</td>
      <td class="Results-table-td Results-table-td--name"><div class="compact">Pat LEE</div></td>
      <td class="Results-table-td Results-table-td--gender"><div class="compact">Female</div></td>
      <td class="Results-table-td Results-table-td--ageGroup"><div class="compact">SW30-34</div></td>
      <td class="Results-table-td Results-table-td--club"><div class="compact"></div></td>
      <td class="Results-table-td Results-table-td--time"><div class="compact">18:31</div></td>
    </tr>
  </tbody>
</table>`;

const sampleVolunteersHtml = `
<table class="Volunteers-table Volunteers-table--compact js-VolunteersTable">
  <tr class="Volunteers-table-row" data-name="Harry LAND" data-role="Finish Tokens,"></tr>
  <tr class="Volunteers-table-row" data-name="John WILKINSON" data-role="Finish Token Support,"></tr>
</table>`;

function documentFromSampleMarkup(): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><body>${sampleResultsHtml}${sampleVolunteersHtml}</body>`,
    "text/html",
  );
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

const sampleResultsPageUrl = "https://www.parkrun.com.au/mernda/results/400/";

describe("parseResultsFromDocument", () => {
  it("parses finishers from live results table markup", () => {
    const finishers = parseResultsFromDocument(documentFromSampleMarkup());

    expect(finishers).toEqual([
      { position: 1, name: "Alex SMITH", time: "18:30" },
      { position: 2, name: "Sam JONES", time: "18:30" },
      { position: 3, name: "Pat LEE", time: "18:31" },
    ]);
  });
});

describe("activateFinishFunnelOnDocument", () => {
  it("injects a panel and Finish funnel column on activation", () => {
    const document = documentFromSampleMarkup();
    mountFinishFunnelUserscript(document, {
      pageUrl: sampleResultsPageUrl,
    });

    const state = activateFinishFunnelOnDocument(document, {
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
    });

    expect(state).toBeDefined();
    expect(document.querySelector("#finish-funnel-panel")).not.toBeNull();
    expect(
      document.querySelector(".Results-table-th--finishFunnel")?.textContent,
    ).toBe("Finish funnel");
    expect(
      document.querySelectorAll(".Results-table-td--finishFunnel").length,
    ).toBe(3);

    expect(document.querySelector("#finish-funnel-metrics")).not.toBeNull();
    expect(document.querySelector("#finish-funnel-queue-chart")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-layout-setup-mount"),
    ).not.toBeNull();
    expect(document.querySelector("#finish-funnel-settings")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-maximum-lane-count"),
    ).not.toBeNull();

    state?.disconnect();
    deactivateFinishFunnelOnDocument(document);
    expect(document.querySelector("#finish-funnel-panel")).toBeNull();
    expect(
      document.querySelector(".Results-table-th--finishFunnel"),
    ).toBeNull();
  });

  it("re-augments the column when tbody rows change after activation", async () => {
    const document = documentFromSampleMarkup();
    const state = activateFinishFunnelOnDocument(document, {
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
    });

    expect(state).toBeDefined();

    const tbody = document.querySelector(".js-ResultsTbody")!;
    const newRow = document.createElement("tr");
    newRow.className = "Results-table-row";
    newRow.setAttribute("data-position", "99");
    newRow.innerHTML =
      '<td class="Results-table-td Results-table-td--position">99</td>';
    tbody.append(newRow);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      newRow.querySelector(".Results-table-td--finishFunnel"),
    ).not.toBeNull();

    expect(document.querySelector("#finish-funnel-metrics")).not.toBeNull();
    expect(document.querySelector("#finish-funnel-queue-chart")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-layout-setup-mount"),
    ).not.toBeNull();
    expect(document.querySelector("#finish-funnel-settings")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-maximum-lane-count"),
    ).not.toBeNull();

    state?.disconnect();
    deactivateFinishFunnelOnDocument(document);
  });
});

describe("activateFinishFunnelWithPersistedSettings", () => {
  it("loads and seeds persisted settings per event path", () => {
    const storage = createMemoryStorage();
    const storageKey = persistedEventSettingsStorageKey("/mernda/");
    const persisted = {
      ...DEFAULT_PERSISTED_EVENT_SETTINGS,
      maximumLaneCount: 2,
      maximumLaneLengthMetres: 60,
    };
    savePersistedEventSettings(storage, storageKey, persisted);

    const document = documentFromSampleMarkup();
    const state = activateFinishFunnelWithPersistedSettings(document, {
      pageUrl: sampleResultsPageUrl,
      storage,
    });

    expect(state).toBeDefined();
    expect(storage.getItem(storageKey)).toContain('"maximumLaneCount":2');

    expect(document.querySelector("#finish-funnel-metrics")).not.toBeNull();
    expect(document.querySelector("#finish-funnel-queue-chart")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-layout-setup-mount"),
    ).not.toBeNull();
    expect(document.querySelector("#finish-funnel-settings")).not.toBeNull();
    expect(
      document.querySelector("#finish-funnel-maximum-lane-count"),
    ).not.toBeNull();

    state?.disconnect();
    deactivateFinishFunnelOnDocument(document);
  });

  it("persists updated site constraints when inputs change", async () => {
    const storage = createMemoryStorage();
    const storageKey = persistedEventSettingsStorageKey("/mernda/");
    const document = documentFromSampleMarkup();

    const state = activateFinishFunnelWithPersistedSettings(document, {
      pageUrl: sampleResultsPageUrl,
      storage,
    });

    expect(state).toBeDefined();

    const maximumLaneCountInput = document.querySelector<HTMLInputElement>(
      "#finish-funnel-maximum-lane-count",
    );
    expect(maximumLaneCountInput).not.toBeNull();
    maximumLaneCountInput!.value = "2";
    maximumLaneCountInput!.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(storage.getItem(storageKey)).toContain('"maximumLaneCount":2');

    state?.disconnect();
    deactivateFinishFunnelOnDocument(document);
  });

  it("preserves finisher spacing when layout lane length changes", async () => {
    const document = documentFromSampleMarkup();
    const persisted = {
      ...DEFAULT_PERSISTED_EVENT_SETTINGS,
      finisherSpacingMetres: 0.75,
    };
    const state = activateFinishFunnelOnDocument(document, { persisted });

    expect(state).toBeDefined();

    const finisherSpacingInput = document.querySelector<HTMLInputElement>(
      "#finish-funnel-finisher-spacing",
    );
    expect(finisherSpacingInput?.value).toBe("0.75");

    const layoutLaneLengthInput = document.querySelector<HTMLInputElement>(
      "#finish-funnel-layout-lane-length",
    );
    layoutLaneLengthInput!.value = "5";
    layoutLaneLengthInput!.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(finisherSpacingInput?.value).toBe("0.75");
    expect(Number(finisherSpacingInput?.max)).toBe(0.25);

    state?.disconnect();
    deactivateFinishFunnelOnDocument(document);
  });
});

describe("finishFunnelColumnMarkupByPosition", () => {
  it("matches parsed finishers count from HTML parser", () => {
    const html = `${sampleResultsHtml}${sampleVolunteersHtml}`;
    const finishers = parseResultsHtml(html);
    const domFinishers = parseResultsFromDocument(documentFromSampleMarkup());

    expect(domFinishers.length).toBe(finishers.length);
    expect(finishFunnelColumnMarkupByPosition([])).toEqual(new Map());
  });
});
