import {
  eventPathFromResultsPageUrl,
  persistedEventSettingsStorageKey,
} from "../eventPathFromResultsPageUrl";
import {
  DEFAULT_PERSISTED_EVENT_SETTINGS,
  loadPersistedEventSettings,
  type PersistedEventSettings,
  type SettingsStorage,
} from "../persistedEventSettings";
import { resolveFinishFunnelActivation } from "../resolveFinishFunnelActivation";
import {
  attachFinishFunnelPanel,
  FINISH_FUNNEL_PANEL_ID,
} from "./attachFinishFunnelPanel";
import { clearFinishFunnelColumn } from "../augmentResultsTableDom";
import {
  ANALYSE_FINISH_FUNNEL_BUTTON_LABEL,
  HIDE_FINISH_FUNNEL_BUTTON_LABEL,
  mountAnalyseFinishFunnelButton,
} from "./mountAnalyseFinishFunnelButton";

export { FINISH_FUNNEL_PANEL_ID };

export type ActivatedFinishFunnelState = {
  finishers: NonNullable<
    ReturnType<typeof resolveFinishFunnelActivation>
  >["finishers"];
  volunteers: NonNullable<
    ReturnType<typeof resolveFinishFunnelActivation>
  >["volunteers"];
  analysis: NonNullable<
    ReturnType<typeof resolveFinishFunnelActivation>
  >["analysis"];
  momentSeconds: number;
  disconnect: () => void;
};

export function activateFinishFunnelOnDocument(
  document: Document,
  {
    persisted,
    momentSeconds,
    storage,
    storageKey,
  }: {
    persisted: PersistedEventSettings;
    momentSeconds?: number;
    storage?: SettingsStorage;
    storageKey?: string;
  },
): ActivatedFinishFunnelState | undefined {
  const resolved = resolveFinishFunnelActivation(document, {
    persisted,
    momentSeconds,
  });
  if (!resolved) {
    return undefined;
  }

  const {
    table,
    finishers,
    volunteers,
    layout,
    analysis,
    momentSeconds: selectedMomentSeconds,
  } = resolved;

  const panelSession = attachFinishFunnelPanel({
    document,
    table,
    finishers,
    volunteers,
    persisted,
    layout,
    storage,
    storageKey,
    momentSeconds: selectedMomentSeconds,
  });

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
    momentSeconds: panelSession.momentSeconds,
    disconnect: () => {
      panelSession.disconnect();
    },
  };
}

export function activateFinishFunnelWithPersistedSettings(
  document: Document,
  {
    pageUrl,
    storage,
    momentSeconds,
  }: {
    pageUrl: string;
    storage: SettingsStorage;
    momentSeconds?: number;
  },
): ActivatedFinishFunnelState | undefined {
  const eventPath = eventPathFromResultsPageUrl(pageUrl);
  const storageKey = eventPath
    ? persistedEventSettingsStorageKey(eventPath)
    : undefined;
  const persisted = storageKey
    ? loadPersistedEventSettings(storage, storageKey)
    : { ...DEFAULT_PERSISTED_EVENT_SETTINGS };

  const state = activateFinishFunnelOnDocument(document, {
    persisted,
    momentSeconds,
    storage,
    storageKey,
  });

  return state;
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
    storage = window.localStorage,
  }: {
    pageUrl?: string;
    storage?: SettingsStorage;
  } = {},
): void {
  let session: ActivatedFinishFunnelState | undefined;

  mountAnalyseFinishFunnelButton(document, {
    pageUrl,
    isActive: false,
    onActivate: () => {
      session = activateFinishFunnelWithPersistedSettings(document, {
        pageUrl,
        storage,
      });
    },
    onDeactivate: () => {
      session?.disconnect();
      deactivateFinishFunnelOnDocument(document);
      session = undefined;
    },
  });
}
