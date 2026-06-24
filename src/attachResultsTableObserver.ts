export function attachResultsTableObserver(
  table: HTMLTableElement,
  onTableChanged: () => void,
): () => void {
  const tbody = table.querySelector("tbody.js-ResultsTbody");
  if (!tbody) {
    return () => {};
  }

  const observer = new MutationObserver(() => {
    onTableChanged();
  });

  observer.observe(tbody, {
    childList: true,
    subtree: false,
  });

  return () => {
    observer.disconnect();
  };
}
