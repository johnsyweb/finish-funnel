import { assignFinisherLanes } from "./assignFinisherLanes";
import { assignUnknownFinishTimes } from "./assignUnknownFinishTimes";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import { batchMarkerMomentsFromAssignments } from "./batchMarkerMoments";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { checkProposedMultiLaneLayout } from "./multiLaneFunnel";
import type { ProposedMultiLaneLayoutCheck } from "./multiLaneFunnel";
import { parseFinishTimeToSeconds } from "./parseFinishTimeToSeconds";
import { simulateFinishTokens } from "./simulateFinishTokens";
import { spreadArrivalsWithinSecond } from "./spreadArrivalsWithinSecond";
import type { FinishTokensSettings, FinisherArrival } from "./types";

export type EventFinisherInput = {
  position: number;
  name: string;
  time: string;
};

export type AnalyzeFinishFunnelInput = {
  finishers: EventFinisherInput[];
  finishTokensSettings?: FinishTokensSettings;
  decelerationZoneMetres?: number;
  finisherSpacingMetres?: number;
  laneCount?: number;
  laneLengthMetres?: number;
};

export type AnalyzeFinishFunnelResult = {
  peakQueueDepth: number;
  funnelNotRequired: boolean;
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>;
  arrivals: FinisherArrival[];
  proposedMultiLaneLayout?: ProposedMultiLaneLayoutCheck;
  batchMarkerMoments: BatchMarkerMoment[];
  finishLineBackupModelled: boolean;
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
      position: finisher.position,
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
  const simulation = simulateFinishTokens({
    arrivals,
    finishTokensSettings,
    laneCount: input.laneCount,
    laneLengthMetres: input.laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const effectiveArrivals = simulation.effectiveArrivals;

  const proposedMultiLaneLayout =
    input.laneCount === undefined || input.laneLengthMetres === undefined
      ? undefined
      : checkProposedMultiLaneLayout({
          laneCount: input.laneCount,
          laneLengthMetres: input.laneLengthMetres,
          peakQueueDepth: simulation.peakQueueDepth,
          decelerationZoneMetres,
          finisherSpacingMetres,
        });

  const batchMarkerMoments =
    input.laneCount === undefined || input.laneLengthMetres === undefined
      ? []
      : batchMarkerMomentsFromAssignments(
          assignFinisherLanes({
            arrivals: effectiveArrivals,
            finisherSchedules: simulation.finisherSchedules,
            laneCount: input.laneCount,
            laneLengthMetres: input.laneLengthMetres,
            decelerationZoneMetres,
            finisherSpacingMetres,
          }),
        );

  return {
    peakQueueDepth: simulation.peakQueueDepth,
    funnelNotRequired: simulation.funnelNotRequired,
    queueDepthOverTime: simulation.queueDepthOverTime,
    arrivals: effectiveArrivals,
    proposedMultiLaneLayout,
    batchMarkerMoments,
    finishLineBackupModelled: simulation.finishLineBackupModelled,
  };
}
