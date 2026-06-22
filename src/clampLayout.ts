export function clampLayoutToSiteConstraints({
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

export function layoutMatchesModelRecommendation(
  layout: { laneCount: number; laneLengthMetres: number },
  modelRecommendation: { laneCount: number; laneLengthMetres: number },
): boolean {
  return (
    layout.laneCount === modelRecommendation.laneCount &&
    layout.laneLengthMetres === modelRecommendation.laneLengthMetres
  );
}
