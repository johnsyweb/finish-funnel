import { analyzeFinishFunnel } from "../analyzeFinishFunnel";
import { augmentResultsTableDom } from "../augmentResultsTableDom";
import { attachResultsTableObserver } from "../attachResultsTableObserver";
import { attachCanvasResizeHandler } from "../attachCanvasResizeHandler";
import { attachChartMomentControls } from "../attachChartMomentControls";
import type { ChartTimeRange } from "../chartMomentMapping";
import { layoutMatchesModelRecommendation } from "../clampLayout";
import { finishTokensSettingsForEvent } from "../finishTokensSettingsForEvent";
import { firstMomentAtPeakQueueDepth } from "../eventResultsAtMoment";
import { hasFinishTokenSupport } from "../parseVolunteersHtml";
import type { ParsedVolunteer } from "../parseVolunteersHtml";
import type { FinishTokensSettings } from "../types";
import {
  savePersistedEventSettings,
  type PersistedEventSettings,
  type SettingsStorage,
} from "../persistedEventSettings";
import type { parseResultsFromDocument } from "../parseResultsFromDocument";
import { runFinishFunnelSimulation } from "../runFinishFunnelSimulation";
import { shouldImmediatelySyncFinisherSpacing } from "../finisherSpacingLimits";
import { buildFinishFunnelPanelMarkup } from "./buildFinishFunnelPanelMarkup";
import { ensureFinishFunnelPanelStyles } from "./finishFunnelPanelStyles";
import {
  renderFinishFunnelPanel,
  type FinishFunnelPanelRenderInput,
} from "./renderFinishFunnelPanel";
import {
  readUserscriptPanelInputs,
  setUserscriptPanelResetButtonVisible,
  writeUserscriptPanelFetchDelay,
  writeUserscriptPanelFinisherSpacing,
  writeUserscriptPanelFinisherSpacingMax,
  writeUserscriptPanelLayout,
  writeUserscriptPanelVolunteerCount,
} from "./userscriptPanelInputs";
import { USERSCRIPT_PANEL_INPUT_IDS as ids } from "./userscriptPanelInputIds";

export const FINISH_FUNNEL_PANEL_ID = "finish-funnel-panel";

export type FinishFunnelPanelSession = {
  momentSeconds: number;
  disconnect: () => void;
  setMomentSeconds: (momentSeconds: number) => void;
};

export type AttachFinishFunnelPanelInput = {
  document: Document;
  table: HTMLTableElement;
  finishers: ReturnType<typeof parseResultsFromDocument>;
  volunteers: ParsedVolunteer[];
  persisted: PersistedEventSettings;
  layout: { laneCount: number; laneLengthMetres: number };
  storage?: SettingsStorage;
  storageKey?: string;
  momentSeconds?: number;
};

function finishTokensSettingsFromPanel(
  persisted: PersistedEventSettings,
  volunteers: ParsedVolunteer[],
): FinishTokensSettings {
  return finishTokensSettingsForEvent({ persisted, volunteers });
}

function panelRenderInput({
  analysis,
  persisted,
  finishTokensSettings,
  layout,
  finishers,
  momentSeconds,
}: {
  analysis: ReturnType<typeof analyzeFinishFunnel>;
  persisted: PersistedEventSettings;
  finishTokensSettings: FinishTokensSettings;
  layout: { laneCount: number; laneLengthMetres: number };
  finishers: ReturnType<typeof parseResultsFromDocument>;
  momentSeconds: number;
}): FinishFunnelPanelRenderInput {
  return {
    analysis,
    persisted,
    finishTokensSettings,
    layout,
    finishers,
    momentSeconds,
  };
}

export function attachFinishFunnelPanel(
  input: AttachFinishFunnelPanelInput,
): FinishFunnelPanelSession {
  const { document, table, finishers, volunteers, storage, storageKey } = input;

  ensureFinishFunnelPanelStyles(document);

  const fetchDelayOverridden = hasFinishTokenSupport(volunteers);
  const initialFinishTokensSettings = finishTokensSettingsFromPanel(
    input.persisted,
    volunteers,
  );

  let panel = document.querySelector<HTMLElement>(`#${FINISH_FUNNEL_PANEL_ID}`);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = FINISH_FUNNEL_PANEL_ID;
    panel.className = "finish-funnel-panel";
    panel.innerHTML = buildFinishFunnelPanelMarkup({
      persisted: input.persisted,
      layout: input.layout,
      volunteerCount: initialFinishTokensSettings.volunteerCount,
      fetchDelayOverridden,
    });
    table.parentElement?.insertAdjacentElement("beforebegin", panel);
  }

  let chartTimeRange: ChartTimeRange = { minTimeSeconds: 0, maxTimeSeconds: 0 };
  let momentSeconds = input.momentSeconds ?? 0;
  let finishFunnelMarkupByPosition = new Map<number, string>();
  let augmentingTable = false;
  let settingsStateKey = "";
  let analysis: ReturnType<typeof analyzeFinishFunnel> | undefined;
  let currentLayout = input.layout;
  let currentPersisted = input.persisted;
  let currentFinishTokensSettings = initialFinishTokensSettings;
  const controlCleanups: Array<() => void> = [];

  const augmentTable = () => {
    if (augmentingTable) {
      return;
    }

    augmentingTable = true;
    try {
      augmentResultsTableDom(table, finishFunnelMarkupByPosition);
    } finally {
      augmentingTable = false;
    }
  };

  const persistSettings = (persisted: PersistedEventSettings) => {
    if (storage && storageKey) {
      savePersistedEventSettings(storage, storageKey, persisted);
    }
  };

  const refreshPanel = ({
    resetMoment = false,
    forceSyncFinisherSpacing = false,
    preserveLayoutAssumptions = false,
  }: {
    resetMoment?: boolean;
    forceSyncFinisherSpacing?: boolean;
    preserveLayoutAssumptions?: boolean;
  } = {}) => {
    const panelInputs = readUserscriptPanelInputs(panel);
    currentPersisted = panelInputs.persisted;
    currentFinishTokensSettings = finishTokensSettingsFromPanel(
      currentPersisted,
      volunteers,
    );

    writeUserscriptPanelVolunteerCount(
      panel,
      currentFinishTokensSettings.volunteerCount,
    );
    writeUserscriptPanelFetchDelay(panel, {
      seconds: currentFinishTokensSettings.tokenSupplyFetchDelaySeconds,
      overridden: fetchDelayOverridden,
    });

    const simulation = runFinishFunnelSimulation({
      finishers,
      persisted: currentPersisted,
      finishTokensSettings: currentFinishTokensSettings,
      layoutRaw: panelInputs.layoutRaw,
      finisherSpacingRaw: panelInputs.finisherSpacingRaw,
      previousSettingsStateKey: settingsStateKey,
    });

    settingsStateKey = simulation.settingsStateKey;
    analysis = simulation.analysis;
    currentLayout = simulation.layout;

    writeUserscriptPanelLayout(panel, currentLayout);

    const finisherSpacingInput = panel.querySelector<HTMLInputElement>(
      `#${ids.finisherSpacing}`,
    );
    if (finisherSpacingInput) {
      writeUserscriptPanelFinisherSpacingMax(
        panel,
        simulation.syncedFinisherSpacing.max,
      );

      if (!preserveLayoutAssumptions) {
        const shouldSync =
          forceSyncFinisherSpacing ||
          simulation.layoutResynced ||
          shouldImmediatelySyncFinisherSpacing(
            finisherSpacingInput.value,
            simulation.syncedFinisherSpacing,
          );

        if (shouldSync) {
          writeUserscriptPanelFinisherSpacing(
            panel,
            simulation.syncedFinisherSpacing,
          );
          currentPersisted = {
            ...currentPersisted,
            finisherSpacingMetres: simulation.finisherSpacingMetres,
          };
        }
      }
    }

    const modelRecommendation = analysis.recommendedFunnelLayout ?? {
      laneCount: currentLayout.laneCount,
      laneLengthMetres: currentLayout.laneLengthMetres,
      sufficient: true,
      combinedLaneCapacity: 0,
      headroomFinishers: 0,
      shortfallFinishers: 0,
    };

    setUserscriptPanelResetButtonVisible(
      panel,
      !layoutMatchesModelRecommendation(currentLayout, modelRecommendation),
    );

    if (resetMoment || simulation.layoutResynced) {
      momentSeconds = firstMomentAtPeakQueueDepth(
        analysis.queueDepthOverTime,
        analysis.peakQueueDepth,
      );
    }

    const rendered = renderFinishFunnelPanel(
      panel,
      panelRenderInput({
        analysis,
        persisted: currentPersisted,
        finishTokensSettings: currentFinishTokensSettings,
        layout: currentLayout,
        finishers,
        momentSeconds,
      }),
    );

    chartTimeRange = rendered.chartTimeRange;
    momentSeconds = rendered.momentSeconds;
    finishFunnelMarkupByPosition = rendered.finishFunnelMarkupByPosition;
    persistSettings(currentPersisted);
    augmentTable();
  };

  refreshPanel({ resetMoment: input.momentSeconds === undefined });

  const chartCanvas = panel.querySelector<HTMLCanvasElement>(
    "#finish-funnel-queue-chart",
  );
  const chartWrap = panel.querySelector("#finish-funnel-chart-wrap");

  controlCleanups.push(
    chartCanvas
      ? attachChartMomentControls({
          canvas: chartCanvas,
          getRange: () => chartTimeRange,
          getMoment: () => momentSeconds,
          getBatchMarkerMoments: () => analysis?.batchMarkerMoments ?? [],
          onMomentChange: (nextMoment) => {
            momentSeconds = nextMoment;
            refreshPanel();
          },
        })
      : () => {},
  );

  controlCleanups.push(
    chartWrap instanceof HTMLElement
      ? attachCanvasResizeHandler(chartWrap, () => {
          refreshPanel();
        })
      : () => {},
  );

  controlCleanups.push(
    attachResultsTableObserver(table, () => {
      augmentTable();
    }),
  );

  const simulationInputIds = [
    ids.tokensPerMinute,
    ids.tokenSupplyBatchSize,
    ids.tokenSupplyFetchDelay,
    ids.decelerationZone,
    ids.finisherSpacing,
    ids.maximumLaneLength,
    ids.maximumLaneCount,
  ] as const;

  for (const inputId of simulationInputIds) {
    const element = panel.querySelector<HTMLInputElement>(`#${inputId}`);
    if (!element || element.readOnly) {
      continue;
    }

    const onInput = () => refreshPanel({ resetMoment: true });
    element.addEventListener("input", onInput);
    controlCleanups.push(() => element.removeEventListener("input", onInput));
  }

  const cordonStakeSpacingInput = panel.querySelector<HTMLInputElement>(
    `#${ids.cordonStakeSpacing}`,
  );
  if (cordonStakeSpacingInput) {
    const onInput = () => refreshPanel();
    cordonStakeSpacingInput.addEventListener("input", onInput);
    controlCleanups.push(() =>
      cordonStakeSpacingInput.removeEventListener("input", onInput),
    );
  }

  const finisherSpacingInput = panel.querySelector<HTMLInputElement>(
    `#${ids.finisherSpacing}`,
  );
  if (finisherSpacingInput) {
    const onBlur = () => refreshPanel({ forceSyncFinisherSpacing: true });
    finisherSpacingInput.addEventListener("blur", onBlur);
    controlCleanups.push(() =>
      finisherSpacingInput.removeEventListener("blur", onBlur),
    );
  }

  for (const inputId of [ids.layoutLaneCount, ids.layoutLaneLength] as const) {
    const element = panel.querySelector<HTMLInputElement>(`#${inputId}`);
    if (!element) {
      continue;
    }

    const onInput = () => refreshPanel({ preserveLayoutAssumptions: true });
    element.addEventListener("input", onInput);
    controlCleanups.push(() => element.removeEventListener("input", onInput));
  }

  const resetButton = panel.querySelector<HTMLButtonElement>(
    `#${ids.resetToModelRecommendation}`,
  );
  if (resetButton) {
    const onClick = () => {
      const panelInputs = readUserscriptPanelInputs(panel);
      const finishTokensSettings = finishTokensSettingsFromPanel(
        panelInputs.persisted,
        volunteers,
      );
      const preview = analyzeFinishFunnel({
        finishers,
        finishTokensSettings,
        decelerationZoneMetres: panelInputs.persisted.decelerationZoneMetres,
        finisherSpacingMetres: panelInputs.persisted.finisherSpacingMetres,
        maximumLaneCount: panelInputs.persisted.maximumLaneCount,
        maximumLaneLengthMetres: panelInputs.persisted.maximumLaneLengthMetres,
        laneCount: panelInputs.layoutRaw.laneCount,
        laneLengthMetres: panelInputs.layoutRaw.laneLengthMetres,
      });

      if (preview.recommendedFunnelLayout !== undefined) {
        writeUserscriptPanelLayout(panel, {
          laneCount: preview.recommendedFunnelLayout.laneCount,
          laneLengthMetres: preview.recommendedFunnelLayout.laneLengthMetres,
        });
      }

      refreshPanel();
    };

    resetButton.addEventListener("click", onClick);
    controlCleanups.push(() =>
      resetButton.removeEventListener("click", onClick),
    );
  }

  return {
    momentSeconds,
    setMomentSeconds: (nextMomentSeconds) => {
      momentSeconds = nextMomentSeconds;
      refreshPanel();
    },
    disconnect: () => {
      for (const cleanup of controlCleanups) {
        cleanup();
      }
    },
  };
}
