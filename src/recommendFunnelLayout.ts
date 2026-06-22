import { recommendPhysicalFunnelLength } from "./recommendPhysicalFunnelLength";
import {
  combinedLaneCapacity,
  type FunnelLayoutAdequacy,
  funnelLayoutAdequacy,
} from "./multiLaneFunnel";

export type RecommendedFunnelLayout = FunnelLayoutAdequacy & {
  laneCount: number;
  laneLengthMetres: number;
};

export type ModelRecommendation = RecommendedFunnelLayout;

export function minimumLaneLengthMetres({
  laneCount,
  peakQueueDepth,
  maximumLaneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  laneCount: number;
  peakQueueDepth: number;
  maximumLaneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number | undefined {
  if (laneCount <= 0 || maximumLaneLengthMetres < 0) {
    return undefined;
  }

  let laneLengthMetres = recommendPhysicalFunnelLength({
    queueCapacity: Math.ceil(peakQueueDepth / laneCount),
    decelerationZoneMetres,
    finisherSpacingMetres,
  });

  while (laneLengthMetres <= maximumLaneLengthMetres) {
    if (
      combinedLaneCapacity({
        laneCount,
        laneLengthMetres,
        decelerationZoneMetres,
        finisherSpacingMetres,
      }) >= peakQueueDepth
    ) {
      return laneLengthMetres;
    }

    laneLengthMetres += 1;
  }

  return undefined;
}

export function recommendFunnelLayout({
  peakQueueDepth,
  maximumLaneLengthMetres,
  maximumLaneCount,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  peakQueueDepth: number;
  maximumLaneLengthMetres: number;
  maximumLaneCount: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): RecommendedFunnelLayout {
  const cappedMaximumLaneCount = Math.max(1, maximumLaneCount);
  const cappedMaximumLaneLength = Math.max(0, maximumLaneLengthMetres);

  for (let laneCount = 1; laneCount <= cappedMaximumLaneCount; laneCount += 1) {
    const laneLengthMetres = minimumLaneLengthMetres({
      laneCount,
      peakQueueDepth,
      maximumLaneLengthMetres: cappedMaximumLaneLength,
      decelerationZoneMetres,
      finisherSpacingMetres,
    });

    if (laneLengthMetres === undefined) {
      continue;
    }

    return {
      laneCount,
      laneLengthMetres,
      ...funnelLayoutAdequacy({
        laneCount,
        laneLengthMetres,
        peakQueueDepth,
        decelerationZoneMetres,
        finisherSpacingMetres,
      }),
    };
  }

  const laneCount = cappedMaximumLaneCount;
  const laneLengthMetres = cappedMaximumLaneLength;

  return {
    laneCount,
    laneLengthMetres,
    ...funnelLayoutAdequacy({
      laneCount,
      laneLengthMetres,
      peakQueueDepth,
      decelerationZoneMetres,
      finisherSpacingMetres,
    }),
  };
}
