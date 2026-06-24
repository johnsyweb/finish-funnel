import {
  analyzeFinishFunnel,
  type EventFinisherInput,
} from "./analyzeFinishFunnel";
import { clampLayoutToSiteConstraints } from "./clampLayout";
import { DEFAULT_FINISHER_SPACING_METRES } from "./defaults";
import {
  finisherSpacingMetresFromInput,
  syncFinisherSpacingInputValue,
} from "./finisherSpacingLimits";
import type { PersistedEventSettings } from "./persistedEventSettings";
import { simulationSettingsStateKey } from "./simulationSettingsStateKey";
import type { FinishTokensSettings } from "./types";

export type RunFinishFunnelSimulationInput = {
  finishers: EventFinisherInput[];
  persisted: PersistedEventSettings;
  finishTokensSettings: FinishTokensSettings;
  layoutRaw: { laneCount: number; laneLengthMetres: number };
  finisherSpacingRaw: string;
  previousSettingsStateKey: string;
};

export type RunFinishFunnelSimulationResult = {
  analysis: ReturnType<typeof analyzeFinishFunnel>;
  layout: { laneCount: number; laneLengthMetres: number };
  settingsStateKey: string;
  layoutResynced: boolean;
  finisherSpacingMetres: number;
  syncedFinisherSpacing: { value: string; max: string };
};

export function runFinishFunnelSimulation(
  input: RunFinishFunnelSimulationInput,
): RunFinishFunnelSimulationResult {
  const {
    finishers,
    persisted,
    finishTokensSettings,
    layoutRaw: initialLayoutRaw,
    finisherSpacingRaw,
    previousSettingsStateKey,
  } = input;

  const settingsStateKey = simulationSettingsStateKey({
    persisted,
    finisherSpacingRaw,
  });
  const layoutResynced = settingsStateKey !== previousSettingsStateKey;

  let layoutRaw = initialLayoutRaw;

  if (layoutResynced) {
    const preview = analyzeFinishFunnel({
      finishers,
      finishTokensSettings,
      decelerationZoneMetres: persisted.decelerationZoneMetres,
      finisherSpacingMetres: finisherSpacingMetresFromInput({
        rawValue: finisherSpacingRaw,
        fallback: persisted.finisherSpacingMetres,
        laneLengthMetres: layoutRaw.laneLengthMetres,
        decelerationZoneMetres: persisted.decelerationZoneMetres,
      }),
      maximumLaneCount: persisted.maximumLaneCount,
      maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
      laneCount: layoutRaw.laneCount,
      laneLengthMetres: layoutRaw.laneLengthMetres,
    });

    if (preview.recommendedFunnelLayout !== undefined) {
      layoutRaw = {
        laneCount: preview.recommendedFunnelLayout.laneCount,
        laneLengthMetres: preview.recommendedFunnelLayout.laneLengthMetres,
      };
    }
  }

  const layout = clampLayoutToSiteConstraints({
    ...layoutRaw,
    maximumLaneCount: persisted.maximumLaneCount,
    maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
  });

  const syncedFinisherSpacing = syncFinisherSpacingInputValue({
    rawValue: finisherSpacingRaw,
    laneLengthMetres: layout.laneLengthMetres,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    fallback: DEFAULT_FINISHER_SPACING_METRES,
  });

  const finisherSpacingMetres = layoutResynced
    ? syncedFinisherSpacing.metres
    : finisherSpacingMetresFromInput({
        rawValue: finisherSpacingRaw,
        fallback: persisted.finisherSpacingMetres,
        laneLengthMetres: layout.laneLengthMetres,
        decelerationZoneMetres: persisted.decelerationZoneMetres,
      });

  const analysis = analyzeFinishFunnel({
    finishers,
    finishTokensSettings,
    decelerationZoneMetres: persisted.decelerationZoneMetres,
    finisherSpacingMetres,
    maximumLaneCount: persisted.maximumLaneCount,
    maximumLaneLengthMetres: persisted.maximumLaneLengthMetres,
    laneCount: layout.laneCount,
    laneLengthMetres: layout.laneLengthMetres,
  });

  return {
    analysis,
    layout,
    settingsStateKey,
    layoutResynced,
    finisherSpacingMetres,
    syncedFinisherSpacing: {
      value: syncedFinisherSpacing.value,
      max: syncedFinisherSpacing.max,
    },
  };
}
