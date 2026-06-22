export function stakesPerCordonLine(
  laneLengthMetres: number,
  cordonStakeSpacingMetres: number,
): number {
  return Math.ceil(laneLengthMetres / cordonStakeSpacingMetres) + 1;
}

export function cordonLineCount(laneCount: number): number {
  return laneCount + 1;
}

export function cordonStakeCount({
  laneCount,
  laneLengthMetres,
  cordonStakeSpacingMetres,
}: {
  laneCount: number;
  laneLengthMetres: number;
  cordonStakeSpacingMetres: number;
}): number {
  return (
    cordonLineCount(laneCount) *
    stakesPerCordonLine(laneLengthMetres, cordonStakeSpacingMetres)
  );
}
