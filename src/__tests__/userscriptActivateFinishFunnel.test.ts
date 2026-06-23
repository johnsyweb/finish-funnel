// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { finishFunnelColumnMarkupByPosition } from "../buildFinishFunnelColumnMarkup";
import {
  activateFinishFunnelOnDocument,
  deactivateFinishFunnelOnDocument,
  mountFinishFunnelUserscript,
} from "../userscript/activateFinishFunnel";
import { parseResultsFromDocument } from "../parseResultsFromDocument";
import { parseResultsHtml } from "../parseResultsHtml";

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
      laneCount: 1,
      laneLengthMetres: 30,
      decelerationZoneMetres: 5,
      finisherSpacingMetres: 0.75,
      maximumLaneCount: 1,
      maximumLaneLengthMetres: 30,
    });

    expect(state).toBeDefined();
    expect(document.querySelector("#finish-funnel-panel")).not.toBeNull();
    expect(
      document.querySelector(".Results-table-th--finishFunnel")?.textContent,
    ).toBe("Finish funnel");
    expect(
      document.querySelectorAll(".Results-table-td--finishFunnel").length,
    ).toBe(3);

    deactivateFinishFunnelOnDocument(document);
    expect(document.querySelector("#finish-funnel-panel")).toBeNull();
    expect(
      document.querySelector(".Results-table-th--finishFunnel"),
    ).toBeNull();
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
