import { describe, expect, it } from "vitest";
import { parseResultsHtml } from "../parseResultsHtml";

const sampleRow = (position: number, time: string) =>
  `<tr class="Results-table-row" data-position="${position}">
    <td class="Results-table-td Results-table-td--position">${position}</td>
    <td class="Results-table-td Results-table-td--time ">
      <div class="compact" translate="no">${time}</div>
    </td>
  </tr>`;

describe("parseResultsHtml", () => {
  it("extracts position and finish time from a parkrun results table row", () => {
    const html = `<table>${sampleRow(1, "18:34")}${sampleRow(2, "19:01")}</table>`;

    const finishers = parseResultsHtml(html);

    expect(finishers).toEqual([
      { position: 1, time: "18:34" },
      { position: 2, time: "19:01" },
    ]);
  });

  it("treats an empty time cell as Unknown", () => {
    const html = `<table>${sampleRow(7, "")}</table>`;
    const finishers = parseResultsHtml(html);

    expect(finishers).toEqual([{ position: 7, time: "Unknown" }]);
  });
});
