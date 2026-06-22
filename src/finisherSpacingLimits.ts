import { DEFAULT_FINISHER_SPACING_METRES } from "./defaults";

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

export function syncFinisherSpacingInputValue({
  rawValue,
  laneLengthMetres,
  decelerationZoneMetres,
  fallback = DEFAULT_FINISHER_SPACING_METRES,
}: {
  rawValue: string;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  fallback?: number;
}): {
  value: string;
  max: string;
  metres: number;
} {
  const metres = finisherSpacingMetresFromInput({
    rawValue,
    fallback,
    laneLengthMetres,
    decelerationZoneMetres,
  });
  const maximum = maximumFinisherSpacingMetres({
    laneLengthMetres,
    decelerationZoneMetres,
  });
  const max = String(Math.max(MINIMUM_FINISHER_SPACING_METRES, maximum));

  return {
    value: String(metres),
    max,
    metres,
  };
}

export function shouldImmediatelySyncFinisherSpacing(
  rawValue: string,
  synced: { max: string },
): boolean {
  if (rawValue === "" || rawValue === "0") {
    return true;
  }

  if (/^0\.$/.test(rawValue)) {
    return false;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return true;
  }

  if (parsed <= 0) {
    return true;
  }

  if (parsed > Number(synced.max)) {
    return true;
  }

  if (parsed > 0 && parsed < MINIMUM_FINISHER_SPACING_METRES) {
    return true;
  }

  return false;
}
