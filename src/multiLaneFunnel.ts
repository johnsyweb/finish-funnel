import { proposedFunnelQueueCapacity } from "./checkProposedFunnel";

export function laneQueueCapacity({
  laneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number {
  return proposedFunnelQueueCapacity({
    proposedMetres: laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
}

export function combinedLaneCapacity({
  laneCount,
  laneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  laneCount: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number {
  const perLane = laneQueueCapacity({
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  return perLane * laneCount;
}

export function minimumLanesRequired({
  peakQueueDepth,
  laneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  peakQueueDepth: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number {
  const perLane = laneQueueCapacity({
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  if (perLane === 0) {
    return peakQueueDepth > 0 ? Number.POSITIVE_INFINITY : 0;
  }
  return Math.ceil(peakQueueDepth / perLane);
}

export type ProposedMultiLaneLayoutCheck = {
  sufficient: boolean;
  combinedLaneCapacity: number;
  headroomFinishers: number;
  shortfallFinishers: number;
  minimumLanesRequired: number;
};

export function checkProposedMultiLaneLayout({
  laneCount,
  laneLengthMetres,
  peakQueueDepth,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  laneCount: number;
  laneLengthMetres: number;
  peakQueueDepth: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): ProposedMultiLaneLayoutCheck {
  const combinedLaneCapacityValue = combinedLaneCapacity({
    laneCount,
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const sufficient = combinedLaneCapacityValue >= peakQueueDepth;
  const difference = combinedLaneCapacityValue - peakQueueDepth;

  return {
    sufficient,
    combinedLaneCapacity: combinedLaneCapacityValue,
    headroomFinishers: sufficient ? difference : 0,
    shortfallFinishers: sufficient ? 0 : -difference,
    minimumLanesRequired: minimumLanesRequired({
      peakQueueDepth,
      laneLengthMetres,
      decelerationZoneMetres,
      finisherSpacingMetres,
    }),
  };
}
