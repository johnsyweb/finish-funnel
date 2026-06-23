import { buildEmptyFinishFunnelColumnCellMarkup } from "./buildFinishFunnelColumnMarkup";

export const FINISH_FUNNEL_HEADER_CLASS = "Results-table-th--finishFunnel";
export const FINISH_FUNNEL_CELL_CLASS = "Results-table-td--finishFunnel";

export function ensureFinishFunnelColumnHeader(table: HTMLTableElement): void {
  const headerRow = table.querySelector("thead tr");
  if (!headerRow) {
    return;
  }

  if (headerRow.querySelector(`.${FINISH_FUNNEL_HEADER_CLASS}`)) {
    return;
  }

  const header = document.createElement("th");
  header.className = `Results-table-th ${FINISH_FUNNEL_HEADER_CLASS}`;
  header.textContent = "Finish funnel";
  headerRow.append(header);
}

export function augmentResultsTableRow(
  row: HTMLTableRowElement,
  cellMarkup: string,
): void {
  let cell = row.querySelector(`.${FINISH_FUNNEL_CELL_CLASS}`);
  if (!cell) {
    cell = document.createElement("td");
    cell.className = `Results-table-td ${FINISH_FUNNEL_CELL_CLASS}`;
    row.append(cell);
  }

  cell.innerHTML = cellMarkup;
}

export function augmentResultsTableDom(
  table: HTMLTableElement,
  finishFunnelMarkupByPosition: Map<number, string>,
): void {
  ensureFinishFunnelColumnHeader(table);

  for (const row of table.querySelectorAll("tr.Results-table-row")) {
    const position = Number(row.getAttribute("data-position"));
    const markup = Number.isFinite(position)
      ? (finishFunnelMarkupByPosition.get(position) ??
        buildEmptyFinishFunnelColumnCellMarkup())
      : buildEmptyFinishFunnelColumnCellMarkup();

    augmentResultsTableRow(row as HTMLTableRowElement, markup);
  }
}

export function clearFinishFunnelColumn(table: HTMLTableElement): void {
  table.querySelector(`.${FINISH_FUNNEL_HEADER_CLASS}`)?.remove();

  for (const cell of table.querySelectorAll(`.${FINISH_FUNNEL_CELL_CLASS}`)) {
    cell.remove();
  }
}
