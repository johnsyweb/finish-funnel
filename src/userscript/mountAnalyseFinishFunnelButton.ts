import { hasFinishersResultsTable } from "../hasFinishersResultsTable";
import { isEventResultsPageUrl } from "../isEventResultsPageUrl";

export function canActivateFinishFunnel(
  url: string,
  root: ParentNode,
): boolean {
  return isEventResultsPageUrl(url) && hasFinishersResultsTable(root);
}

export const ANALYSE_FINISH_FUNNEL_BUTTON_ID = "finish-funnel-analyse-button";
export const HIDE_FINISH_FUNNEL_BUTTON_LABEL = "Hide Finish Funnel";
export const ANALYSE_FINISH_FUNNEL_BUTTON_LABEL = "Analyse finish funnel";

export function buildAnalyseFinishFunnelButtonMarkup(): string {
  return `<button type="button" id="${ANALYSE_FINISH_FUNNEL_BUTTON_ID}" class="finish-funnel-analyse-button">${ANALYSE_FINISH_FUNNEL_BUTTON_LABEL}</button>`;
}

export function mountAnalyseFinishFunnelButton(
  document: Document,
  {
    onActivate,
    onDeactivate,
    isActive = false,
    pageUrl = document.location.href,
  }: {
    onActivate: () => void;
    onDeactivate: () => void;
    isActive?: boolean;
    pageUrl?: string;
  },
): HTMLButtonElement | undefined {
  if (!canActivateFinishFunnel(pageUrl, document)) {
    return undefined;
  }

  const table = document.querySelector("table.Results-table.js-ResultsTable");
  if (!table) {
    return undefined;
  }

  let button = document.querySelector<HTMLButtonElement>(
    `#${ANALYSE_FINISH_FUNNEL_BUTTON_ID}`,
  );

  if (!button) {
    button = document.createElement("button");
    button.id = ANALYSE_FINISH_FUNNEL_BUTTON_ID;
    button.type = "button";
    button.className = "finish-funnel-analyse-button";
    table.parentElement?.insertAdjacentElement("beforebegin", button);
  }

  button.textContent = isActive
    ? HIDE_FINISH_FUNNEL_BUTTON_LABEL
    : ANALYSE_FINISH_FUNNEL_BUTTON_LABEL;

  button.onclick = () => {
    if (button?.textContent === HIDE_FINISH_FUNNEL_BUTTON_LABEL) {
      onDeactivate();
    } else {
      onActivate();
    }
  };

  return button;
}
