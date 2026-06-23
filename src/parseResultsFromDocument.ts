import type { ParsedFinisher } from "./parseResultsHtml";

function readTimeFromResultsRow(row: Element): string {
  const compactTime = row.querySelector(
    ".Results-table-td--time .compact",
  )?.textContent;
  const timeText = compactTime?.trim() ?? "";
  return timeText.length > 0 ? timeText : "Unknown";
}

export function parseResultsFromDocument(document: Document): ParsedFinisher[] {
  const rows = document.querySelectorAll("tr.Results-table-row[data-position]");
  const finishers: ParsedFinisher[] = [];

  for (const row of rows) {
    const position = Number(row.getAttribute("data-position"));
    if (!Number.isFinite(position)) {
      continue;
    }

    finishers.push({
      position,
      name: row.getAttribute("data-name") ?? "",
      time: readTimeFromResultsRow(row),
    });
  }

  return finishers;
}
