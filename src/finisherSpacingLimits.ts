export const MINIMUM_FINISHER_SPACING_METRES = 0.25;

export function laneQueueZoneMetres({
  laneLengthMetres,
  decelerationZoneMetres,
}: {
  laneLengthMetres: number;
  decelerationZoneMetres: number;
}): number {
  return Math.max(0, laneLengthMetres - decelerationZoneMetres);
}

export function maximumFinisherSpacingMetres(layout: {
  laneLengthMetres: number;
  decelerationZoneMetres: number;
}): number {
  return laneQueueZoneMetres(layout);
}

export function clampFinisherSpacingMetres({
  finisherSpacingMetres,
  laneLengthMetres,
  decelerationZoneMetres,
  minimumFinisherSpacingMetres = MINIMUM_FINISHER_SPACING_METRES,
}: {
  finisherSpacingMetres: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  minimumFinisherSpacingMetres?: number;
}): number {
  const maximum = maximumFinisherSpacingMetres({
    laneLengthMetres,
    decelerationZoneMetres,
  });

  if (maximum < minimumFinisherSpacingMetres) {
    return minimumFinisherSpacingMetres;
  }

  return Math.min(
    maximum,
    Math.max(minimumFinisherSpacingMetres, finisherSpacingMetres),
  );
}

export function finisherSpacingMetresFromInput({
  rawValue,
  fallback,
  laneLengthMetres,
  decelerationZoneMetres,
}: {
  rawValue: string;
  fallback: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
}): number {
  const parsed = Number(rawValue);

  return clampFinisherSpacingMetres({
    finisherSpacingMetres:
      Number.isFinite(parsed) && parsed > 0 ? parsed : fallback,
    laneLengthMetres,
    decelerationZoneMetres,
  });
}
