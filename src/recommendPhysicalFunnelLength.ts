export function recommendPhysicalFunnelLength({
  queueCapacity,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  queueCapacity: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): number {
  const queueMetres = queueCapacity * finisherSpacingMetres;
  const exactLength = decelerationZoneMetres + queueMetres;
  return Math.ceil(exactLength);
}
