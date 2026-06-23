export function hasFinishersResultsTable(root: ParentNode): boolean {
  return root.querySelector("table.Results-table.js-ResultsTable") !== null;
}
