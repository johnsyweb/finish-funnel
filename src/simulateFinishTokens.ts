import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { combinedLaneCapacity } from "./multiLaneFunnel";
import { simulateFinishFunnel } from "./simulateFinishFunnel";
import type {
  FinisherArrival,
  FinishTokensSettings,
  SimulationResult,
} from "./types";

export type FinishTokensSimulationInput = {
  arrivals: FinisherArrival[];
  finishTokensSettings?: FinishTokensSettings;
  laneCount?: number;
  laneLengthMetres?: number;
  decelerationZoneMetres?: number;
  finisherSpacingMetres?: number;
};

export type FinishTokensSimulationResult = SimulationResult & {
  finishLineBackupModelled: boolean;
};

export function simulateFinishTokens(
  input: FinishTokensSimulationInput,
): FinishTokensSimulationResult {
  const finishTokensSettings =
    input.finishTokensSettings ?? DEFAULT_FINISH_TOKENS_SETTINGS;
  const decelerationZoneMetres =
    input.decelerationZoneMetres ?? DEFAULT_DECELERATION_ZONE_METRES;
  const finisherSpacingMetres =
    input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES;

  const finishLineBackupModelled =
    input.laneCount !== undefined && input.laneLengthMetres !== undefined;

  const maxQueueDepth = finishLineBackupModelled
    ? combinedLaneCapacity({
        laneCount: input.laneCount!,
        laneLengthMetres: input.laneLengthMetres!,
        decelerationZoneMetres,
        finisherSpacingMetres,
      })
    : undefined;

  const simulation = simulateFinishFunnel(
    input.arrivals,
    finishTokensSettings,
    maxQueueDepth === undefined ? {} : { maxQueueDepth },
  );

  return {
    ...simulation,
    finishLineBackupModelled,
  };
}
