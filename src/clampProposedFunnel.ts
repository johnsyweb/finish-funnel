export function clampProposedFunnelToSiteConstraints({
  laneCount,
  laneLengthMetres,
  maximumLaneCount,
  maximumLaneLengthMetres,
}: {
  laneCount: number;
  laneLengthMetres: number;
  maximumLaneCount: number;
  maximumLaneLengthMetres: number;
}): { laneCount: number; laneLengthMetres: number } {
  return {
    laneCount: Math.min(Math.max(1, laneCount), Math.max(1, maximumLaneCount)),
    laneLengthMetres: Math.min(
      Math.max(0, laneLengthMetres),
      Math.max(0, maximumLaneLengthMetres),
    ),
  };
}

export function proposedFunnelMatchesRecommendation(
  proposed: { laneCount: number; laneLengthMetres: number },
  recommended: { laneCount: number; laneLengthMetres: number },
): boolean {
  return (
    proposed.laneCount === recommended.laneCount &&
    proposed.laneLengthMetres === recommended.laneLengthMetres
  );
}
