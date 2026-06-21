import { assignUnknownFinishTimes } from "./assignUnknownFinishTimes";
import { checkProposedFunnel } from "./checkProposedFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { parseFinishTimeToSeconds } from "./parseFinishTimeToSeconds";
import { recommendPhysicalFunnelLength } from "./recommendPhysicalFunnelLength";
import { simulateFinishFunnel } from "./simulateFinishFunnel";
import { spreadArrivalsWithinSecond } from "./spreadArrivalsWithinSecond";
import type { FinishTokensSettings, FinisherArrival } from "./types";

export type EventFinisherInput = {
  position: number;
  time: string;
};

export type AnalyzeFinishFunnelInput = {
  finishers: EventFinisherInput[];
  finishTokensSettings?: FinishTokensSettings;
  decelerationZoneMetres?: number;
  finisherSpacingMetres?: number;
  proposedFunnelMetres?: number;
};

export type AnalyzeFinishFunnelResult = {
  peakQueueDepth: number;
  recommendedLengthMetres: number;
  funnelNotRequired: boolean;
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>;
  arrivals: FinisherArrival[];
  proposedFunnel?: ReturnType<typeof checkProposedFunnel>;
};

export function buildFinisherArrivals(
  finishers: EventFinisherInput[],
): FinisherArrival[] {
  const ordered = [...finishers].sort((a, b) => a.position - b.position);
  const withTimes = assignUnknownFinishTimes(
    ordered.map((finisher) => ({
      position: finisher.position,
      timeSeconds: parseFinishTimeToSeconds(finisher.time),
    })),
  );

  return spreadArrivalsWithinSecond(
    withTimes.map((finisher) => ({
      timeSeconds: finisher.timeSeconds,
      estimated: finisher.estimated,
    })),
  );
}

export function analyzeFinishFunnel(
  input: AnalyzeFinishFunnelInput,
): AnalyzeFinishFunnelResult {
  const finishTokensSettings =
    input.finishTokensSettings ?? DEFAULT_FINISH_TOKENS_SETTINGS;
  const decelerationZoneMetres =
    input.decelerationZoneMetres ?? DEFAULT_DECELERATION_ZONE_METRES;
  const finisherSpacingMetres =
    input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES;

  const arrivals = buildFinisherArrivals(input.finishers);
  const simulation = simulateFinishFunnel(arrivals, finishTokensSettings);
  const recommendedLengthMetres = recommendPhysicalFunnelLength({
    queueCapacity: simulation.peakQueueDepth,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });

  const proposedFunnel =
    input.proposedFunnelMetres === undefined
      ? undefined
      : checkProposedFunnel({
          proposedMetres: input.proposedFunnelMetres,
          peakQueueDepth: simulation.peakQueueDepth,
          decelerationZoneMetres,
          finisherSpacingMetres,
        });

  return {
    peakQueueDepth: simulation.peakQueueDepth,
    recommendedLengthMetres,
    funnelNotRequired: simulation.funnelNotRequired,
    queueDepthOverTime: simulation.queueDepthOverTime,
    arrivals,
    proposedFunnel,
  };
}
