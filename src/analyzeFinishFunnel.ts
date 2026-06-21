import { assignFinisherLanes } from "./assignFinisherLanes";
import { assignUnknownFinishTimes } from "./assignUnknownFinishTimes";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import { batchMarkerMomentsFromAssignments } from "./batchMarkerMoments";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
  DEFAULT_FINISHER_SPACING_METRES,
} from "./defaults";
import { clampFinisherSpacingMetres } from "./finisherSpacingLimits";
import type { FinishLineBackupDelaySummary } from "./finishLineBackupDelays";
import type { TokenSupplyGapSummary } from "./tokenSupplyGapSummary";
import { finishLineBackupDelaySummary } from "./finishLineBackupDelays";
import {
  checkProposedMultiLaneLayout,
  type ProposedMultiLaneLayoutCheck,
} from "./multiLaneFunnel";
import { parseFinishTimeToSeconds } from "./parseFinishTimeToSeconds";
import {
  recommendFunnelLayout,
  type RecommendedFunnelLayout,
} from "./recommendFunnelLayout";
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
  maximumLaneLengthMetres?: number;
  maximumLaneCount?: number;
  laneCount?: number;
  laneLengthMetres?: number;
};

export type AnalyzeFinishFunnelResult = {
  peakQueueDepth: number;
  funnelNotRequired: boolean;
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>;
  arrivals: FinisherArrival[];
  recommendedFunnelLayout?: RecommendedFunnelLayout;
  proposedMultiLaneLayout?: ProposedMultiLaneLayoutCheck;
  batchMarkerMoments: BatchMarkerMoment[];
  finishLineBackupModelled: boolean;
  finishLineBackupDelays?: FinishLineBackupDelaySummary;
  tokenSupplyGaps?: TokenSupplyGapSummary;
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
  const proposedLaneLengthMetres = input.laneLengthMetres;
  const finisherSpacingMetres =
    proposedLaneLengthMetres === undefined
      ? (input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES)
      : clampFinisherSpacingMetres({
          finisherSpacingMetres:
            input.finisherSpacingMetres ?? DEFAULT_FINISHER_SPACING_METRES,
          laneLengthMetres: proposedLaneLengthMetres,
          decelerationZoneMetres,
        });

  const publishedArrivals = buildFinisherArrivals(input.finishers);
  const uncappedSimulation = simulateFinishTokens({
    arrivals: publishedArrivals,
    finishTokensSettings,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });

  const recommendedFunnelLayout =
    input.maximumLaneCount === undefined ||
    input.maximumLaneLengthMetres === undefined
      ? undefined
      : recommendFunnelLayout({
          peakQueueDepth: uncappedSimulation.peakQueueDepth,
          maximumLaneLengthMetres: input.maximumLaneLengthMetres,
          maximumLaneCount: input.maximumLaneCount,
          decelerationZoneMetres,
          finisherSpacingMetres,
        });

  const layoutSimulation =
    input.laneCount === undefined || input.laneLengthMetres === undefined
      ? uncappedSimulation
      : simulateFinishTokens({
          arrivals: publishedArrivals,
          finishTokensSettings,
          laneCount: input.laneCount,
          laneLengthMetres: input.laneLengthMetres,
          decelerationZoneMetres,
          finisherSpacingMetres,
        });

  const effectiveArrivals = layoutSimulation.effectiveArrivals;
  const finishLineBackupDelays = layoutSimulation.finishLineBackupModelled
    ? finishLineBackupDelaySummary({
        publishedArrivals,
        effectiveArrivals,
      })
    : undefined;

  const proposedMultiLaneLayout =
    input.laneCount === undefined || input.laneLengthMetres === undefined
      ? undefined
      : checkProposedMultiLaneLayout({
          laneCount: input.laneCount,
          laneLengthMetres: input.laneLengthMetres,
          peakQueueDepth: uncappedSimulation.peakQueueDepth,
          decelerationZoneMetres,
          finisherSpacingMetres,
        });

  const batchMarkerMoments =
    input.laneCount === undefined || input.laneLengthMetres === undefined
      ? []
      : batchMarkerMomentsFromAssignments(
          assignFinisherLanes({
            arrivals: effectiveArrivals,
            finisherSchedules: layoutSimulation.finisherSchedules,
            laneCount: input.laneCount,
            laneLengthMetres: input.laneLengthMetres,
            decelerationZoneMetres,
            finisherSpacingMetres,
          }),
        );

  return {
    peakQueueDepth: uncappedSimulation.peakQueueDepth,
    funnelNotRequired: uncappedSimulation.funnelNotRequired,
    queueDepthOverTime: layoutSimulation.queueDepthOverTime,
    arrivals: effectiveArrivals,
    recommendedFunnelLayout,
    proposedMultiLaneLayout,
    batchMarkerMoments,
    finishLineBackupModelled: layoutSimulation.finishLineBackupModelled,
    finishLineBackupDelays,
    tokenSupplyGaps: layoutSimulation.tokenSupplyGaps,
  };
}
