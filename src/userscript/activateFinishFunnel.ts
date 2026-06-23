import {
  augmentResultsTableDom,
  clearFinishFunnelColumn,
} from "../augmentResultsTableDom";
import { finishFunnelColumnMarkupByPosition } from "../buildFinishFunnelColumnMarkup";
import { eventResultsAtMoment } from "../eventResultsAtMoment";
import { finishTokensSettingsFromVolunteers } from "../finishTokensSettingsFromVolunteers";
import { analyzeFinishFunnel } from "../analyzeFinishFunnel";
import { formatFinishClockTime } from "../formatFinishClockTime";
import { parseResultsFromDocument } from "../parseResultsFromDocument";
import { parseVolunteersFromDocument } from "../parseVolunteersFromDocument";
import {
  ANALYSE_FINISH_FUNNEL_BUTTON_LABEL,
  HIDE_FINISH_FUNNEL_BUTTON_LABEL,
  mountAnalyseFinishFunnelButton,
} from "./mountAnalyseFinishFunnelButton";
import { buildFinishFunnelPanelShellMarkup } from "./buildFinishFunnelPanelShellMarkup";

export const FINISH_FUNNEL_PANEL_ID = "finish-funnel-panel";

export type ActivatedFinishFunnelState = {
  finishers: ReturnType<typeof parseResultsFromDocument>;
  volunteers: ReturnType<typeof parseVolunteersFromDocument>;
  analysis: ReturnType<typeof analyzeFinishFunnel>;
  momentSeconds: number;
};

export function activateFinishFunnelOnDocument(
  document: Document,
  {
    momentSeconds,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
    maximumLaneCount,
    maximumLaneLengthMetres,
  }: {
    momentSeconds?: number;
    laneCount: number;
    laneLengthMetres: number;
    decelerationZoneMetres: number;
    finisherSpacingMetres: number;
    maximumLaneCount: number;
    maximumLaneLengthMetres: number;
  },
): ActivatedFinishFunnelState | undefined {
  const table = document.querySelector<HTMLTableElement>(
    "table.Results-table.js-ResultsTable",
  );
  if (!table) {
    return undefined;
  }

  const finishers = parseResultsFromDocument(document);
  if (finishers.length === 0) {
    return undefined;
  }

  const volunteers = parseVolunteersFromDocument(document);
  const finishTokensSettings = finishTokensSettingsFromVolunteers(volunteers);

  const analysis = analyzeFinishFunnel({
    finishers,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
    maximumLaneCount,
    maximumLaneLengthMetres,
    laneCount,
    laneLengthMetres,
  });

  const selectedMomentSeconds =
    momentSeconds ??
    analysis.queueDepthOverTime.find(
      (point) => point.queueDepth === analysis.peakQueueDepth,
    )?.timeSeconds ??
    0;

  const queueResult = eventResultsAtMoment({
    finishers,
    finishTokensSettings,
    momentSeconds: selectedMomentSeconds,
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });

  let panel = document.querySelector(`#${FINISH_FUNNEL_PANEL_ID}`);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = FINISH_FUNNEL_PANEL_ID;
    panel.className = "finish-funnel-panel";
    panel.innerHTML = buildFinishFunnelPanelShellMarkup({
      peakQueueDepth: analysis.peakQueueDepth,
      selectedMomentLabel: formatFinishClockTime(selectedMomentSeconds),
    });
    table.parentElement?.insertAdjacentElement("beforebegin", panel);
  }

  augmentResultsTableDom(
    table,
    finishFunnelColumnMarkupByPosition(queueResult.finishers),
  );

  const button = document.querySelector<HTMLButtonElement>(
    "#finish-funnel-analyse-button",
  );
  if (button) {
    button.textContent = HIDE_FINISH_FUNNEL_BUTTON_LABEL;
  }

  return {
    finishers,
    volunteers,
    analysis,
    momentSeconds: selectedMomentSeconds,
  };
}

export function deactivateFinishFunnelOnDocument(document: Document): void {
  const table = document.querySelector<HTMLTableElement>(
    "table.Results-table.js-ResultsTable",
  );
  if (table) {
    clearFinishFunnelColumn(table);
  }

  document.querySelector(`#${FINISH_FUNNEL_PANEL_ID}`)?.remove();

  const button = document.querySelector<HTMLButtonElement>(
    "#finish-funnel-analyse-button",
  );
  if (button) {
    button.textContent = ANALYSE_FINISH_FUNNEL_BUTTON_LABEL;
  }
}

export function mountFinishFunnelUserscript(
  document: Document,
  {
    pageUrl = document.location.href,
  }: {
    pageUrl?: string;
  } = {},
): void {
  mountAnalyseFinishFunnelButton(document, {
    pageUrl,
    isActive: false,
    onActivate: () => {
      activateFinishFunnelOnDocument(document, {
        laneCount: 1,
        laneLengthMetres: 30,
        decelerationZoneMetres: 5,
        finisherSpacingMetres: 0.75,
        maximumLaneCount: 3,
        maximumLaneLengthMetres: 300,
      });
    },
    onDeactivate: () => {
      deactivateFinishFunnelOnDocument(document);
    },
  });
}
