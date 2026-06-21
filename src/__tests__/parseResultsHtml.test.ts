import { describe, expect, it } from "vitest";
import { parseResultsHtml } from "../parseResultsHtml";

const sampleRow = (position: number, time: string, name = "Example RUNNER") =>
  `<tr class="Results-table-row" data-name="${name}" data-position="${position}">
    <td class="Results-table-td Results-table-td--position">${position}</td>
    <td class="Results-table-td Results-table-td--time ">
      <div class="compact" translate="no">${time}</div>
    </td>
  </tr>`;

describe("parseResultsHtml", () => {
  it("extracts position, name, and finish time from a parkrun results table row", () => {
    const html = `<table>${sampleRow(1, "18:34", "Alex SMITH")}${sampleRow(
      2,
      "19:01",
      "Sam JONES",
    )}</table>`;

    const finishers = parseResultsHtml(html);

    expect(finishers).toEqual([
      { position: 1, name: "Alex SMITH", time: "18:34" },
      { position: 2, name: "Sam JONES", time: "19:01" },
    ]);
  });

  it("extracts name from data-name like a real results row", () => {
    const html = `<table><tr class="Results-table-row" data-name="Carmen PALMER" data-agegroup="VW60-64" data-position="1000">
      <td class="Results-table-td Results-table-td--time ">
        <div class="compact" translate="no">31:52</div>
      </td>
    </tr></table>`;

    expect(parseResultsHtml(html)).toEqual([
      { position: 1000, name: "Carmen PALMER", time: "31:52" },
    ]);
  });

  it("treats an empty time cell as Unknown", () => {
    const html = `<table>${sampleRow(7, "")}</table>`;
    const finishers = parseResultsHtml(html);

    expect(finishers).toEqual([
      { position: 7, name: "Example RUNNER", time: "Unknown" },
    ]);
  });

  it("uses an empty name when data-name is missing", () => {
    const html = `<table><tr class="Results-table-row" data-position="3">
      <td class="Results-table-td Results-table-td--time ">
        <div class="compact" translate="no">20:00</div>
      </td>
    </tr></table>`;

    expect(parseResultsHtml(html)).toEqual([
      { position: 3, name: "", time: "20:00" },
    ]);
  });
});
