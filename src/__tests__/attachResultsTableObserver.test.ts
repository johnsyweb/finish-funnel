// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { attachResultsTableObserver } from "../attachResultsTableObserver";
import { augmentResultsTableDom } from "../augmentResultsTableDom";

describe("attachResultsTableObserver", () => {
  it("re-runs augmentation when tbody rows change", async () => {
    const document = new DOMParser().parseFromString(
      `<!doctype html><body>
        <table class="Results-table js-ResultsTable">
          <thead><tr><th>Time</th></tr></thead>
          <tbody class="js-ResultsTbody">
            <tr class="Results-table-row" data-position="1"><td>18:30</td></tr>
          </tbody>
        </table>
      </body>`,
      "text/html",
    );

    const table = document.querySelector("table")!;
    const markupByPosition = new Map<number, string>([
      [1, "<span>Queued</span>"],
      [2, "<span>Tokened</span>"],
    ]);

    augmentResultsTableDom(table, markupByPosition);
    const disconnect = attachResultsTableObserver(table, () => {
      augmentResultsTableDom(table, markupByPosition);
    });

    const tbody = table.querySelector("tbody")!;
    const newRow = document.createElement("tr");
    newRow.className = "Results-table-row";
    newRow.setAttribute("data-position", "2");
    newRow.innerHTML = "<td>18:31</td>";
    tbody.append(newRow);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      newRow.querySelector(".Results-table-td--finishFunnel")?.innerHTML,
    ).toBe("<span>Tokened</span>");

    disconnect();
  });
});
