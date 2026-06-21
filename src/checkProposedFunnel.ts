export type ProposedFunnelCheck = {
  sufficient: boolean;
  proposedQueueCapacity: number;
  headroomFinishers: number;
  shortfallFinishers: number;
};

export function proposedFunnelQueueCapacity({
  proposedMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  proposedMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number {
  const queueMetres = Math.max(0, proposedMetres - decelerationZoneMetres);
  return Math.floor(queueMetres / finisherSpacingMetres);
}

export function checkProposedFunnel({
  proposedMetres,
  peakQueueDepth,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  proposedMetres: number;
  peakQueueDepth: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): ProposedFunnelCheck {
  const proposedQueueCapacity = proposedFunnelQueueCapacity({
    proposedMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });

  const sufficient = proposedQueueCapacity >= peakQueueDepth;
  const difference = proposedQueueCapacity - peakQueueDepth;

  return {
    sufficient,
    proposedQueueCapacity,
    headroomFinishers: sufficient ? difference : 0,
    shortfallFinishers: sufficient ? 0 : -difference,
  };
}
