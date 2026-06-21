export const CHART_TIME_PADDING = {
  top: 16,
  right: 16,
  bottom: 36,
  left: 48,
};

export type ChartTimeRange = {
  minTimeSeconds: number;
  maxTimeSeconds: number;
};

export function timeRangeFromChartPoints(
  points: Array<{ timeSeconds: number }>,
): ChartTimeRange {
  if (points.length === 0) {
    throw new Error("Chart points are required");
  }

  return {
    minTimeSeconds: points[0].timeSeconds,
    maxTimeSeconds: points[points.length - 1].timeSeconds,
  };
}

export function clampSelectedMoment(
  momentSeconds: number,
  range: ChartTimeRange,
): number {
  return Math.min(
    range.maxTimeSeconds,
    Math.max(range.minTimeSeconds, momentSeconds),
  );
}

export function momentSecondsFromCanvasX(
  canvasX: number,
  canvasWidth: number,
  range: ChartTimeRange,
  padding = CHART_TIME_PADDING,
): number {
  const plotWidth = canvasWidth - padding.left - padding.right;
  const plotX = canvasX - padding.left;
  const ratio = Math.min(1, Math.max(0, plotX / plotWidth));
  const timeSpan = range.maxTimeSeconds - range.minTimeSeconds || 1;

  return clampSelectedMoment(range.minTimeSeconds + ratio * timeSpan, range);
}

export function nudgeSelectedMoment(
  momentSeconds: number,
  deltaSeconds: number,
  range: ChartTimeRange,
): number {
  return clampSelectedMoment(momentSeconds + deltaSeconds, range);
}

export function canvasXFromMomentSeconds(
  momentSeconds: number,
  canvasWidth: number,
  range: ChartTimeRange,
  padding = CHART_TIME_PADDING,
): number {
  const plotWidth = canvasWidth - padding.left - padding.right;
  const timeSpan = range.maxTimeSeconds - range.minTimeSeconds || 1;
  const ratio = (momentSeconds - range.minTimeSeconds) / timeSpan;

  return padding.left + ratio * plotWidth;
}

export function momentSecondsFromClientX(
  clientX: number,
  canvas: HTMLCanvasElement,
  range: ChartTimeRange,
): number {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.clientWidth / rect.width || 1;
  const canvasX = (clientX - rect.left) * scale;

  return momentSecondsFromCanvasX(canvasX, canvas.clientWidth, range);
}
