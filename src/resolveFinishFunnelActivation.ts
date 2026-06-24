import { analyzeFinishFunnel } from "./analyzeFinishFunnel";
import { finishFunnelColumnMarkupByPosition } from "./buildFinishFunnelColumnMarkup";
import {
  eventResultsAtMoment,
  firstMomentAtPeakQueueDepth,
} from "./eventResultsAtMoment";
import { finishTokensSettingsForEvent } from "./finishTokensSettingsForEvent";
import { parseResultsFromDocument } from "./parseResultsFromDocument";
import { parseVolunteersFromDocument } from "./parseVolunteersFromDocument";
import type { PersistedEventSettings } from "./persistedEventSettings";
import type { FinishTokensSettings } from "./types";

const DEFAULT_LAYOUT = {
  laneCount: 1,
  laneLengthMetres: 30,
};

export function resolveFinishFunnelActivation(
  document: Document,
  {
    persisted,
    momentSeconds,
  }: {
    persisted: PersistedEventSettings;
    momentSeconds?: number;
  },
):
  | {
      table: HTMLTableElement;
      finishers: ReturnType<typeof parseResultsFromDocument>;
      volunteers: ReturnType<typeof parseVolunteersFromDocument>;
      finishTokensSettings: FinishTokensSettings;
      layout: { laneCount: number; laneLengthMetres: number };
      analysis: ReturnType<typeof analyzeFinishFunnel>;
      momentSeconds: number;
      finishFunnelMarkupByPosition: Map<number, string>;
    }
  | undefined {
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
  const finishTokensSettings = finishTokensSettingsForEvent({
    persisted,
    volunteers,
  });

  const preview = analyzeFinishFunnel({
    finishers,
    finishTokensSettings,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    finisherSpacingMetres: persisted.finisherSpacingMetres,
    maximumLaneCount: persisted.maximumLaneCount,
    maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
  });

  const layout = preview.recommendedFunnelLayout ?? DEFAULT_LAYOUT;

  const analysis = analyzeFinishFunnel({
    finishers,
    finishTokensSettings,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    finisherSpacingMetres: persisted.finisherSpacingMetres,
    maximumLaneCount: persisted.maximumLaneCount,
    maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
  });

  const selectedMomentSeconds =
    momentSeconds ??
    firstMomentAtPeakQueueDepth(
      analysis.queueDepthOverTime,
      analysis.peakQueueDepth,
    );

  const queueResult = eventResultsAtMoment({
    finishers,
    finishTokensSettings,
    momentSeconds: selectedMomentSeconds,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    finisherSpacingMetres: persisted.finisherSpacingMetres,
  });

  return {
    table,
    finishers,
    volunteers,
    finishTokensSettings,
    layout,
    analysis,
    momentSeconds: selectedMomentSeconds,
    finishFunnelMarkupByPosition: finishFunnelColumnMarkupByPosition(
      queueResult.finishers,
    ),
  };
}
