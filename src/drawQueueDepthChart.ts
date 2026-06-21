import {
  canvasXFromMomentSeconds,
  CHART_TIME_PADDING,
  timeRangeFromChartPoints,
} from "./chartMomentMapping";
import type { BatchMarkerMoment } from "./batchMarkerMoments";
import { formatFinishClockTime } from "./formatFinishClockTime";

export type QueueChartPoint = {
  timeSeconds: number;
  queueDepth: number;
};

export type QueueChartOptions = {
  peakQueueDepth: number;
  proposedQueueCapacity?: number;
  selectedMomentSeconds?: number;
  batchMarkerMoments?: BatchMarkerMoment[];
};

export function drawQueueDepthChart(
  canvas: HTMLCanvasElement,
  points: QueueChartPoint[],
  options: QueueChartOptions,
): void {
  const context = canvas.getContext("2d");
  if (!context || points.length === 0) {
    return;
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;

  const padding = CHART_TIME_PADDING;
  const plotHeight = height - padding.top - padding.bottom;
  const range = timeRangeFromChartPoints(points);

  const minTime = range.minTimeSeconds;
  const maxTime = range.maxTimeSeconds;
  const maxDepth = Math.max(
    options.peakQueueDepth,
    options.proposedQueueCapacity ?? 0,
    1,
  );

  const xForTime = (timeSeconds: number) =>
    canvasXFromMomentSeconds(timeSeconds, width, range, padding);
  const yForDepth = (depth: number) =>
    padding.top + plotHeight - (depth / maxDepth) * plotHeight;

  context.fillStyle = "#1f182e";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(255, 255, 255, 0.12)";
  context.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const depth = (maxDepth * step) / 4;
    const y = yForDepth(depth);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();

    context.fillStyle = "#b8b8c8";
    context.font = "12px sans-serif";
    context.textAlign = "right";
    context.fillText(String(Math.round(depth)), padding.left - 8, y + 4);
  }

  context.strokeStyle = "#ffa300";
  context.lineWidth = 2;
  context.beginPath();
  for (const [index, point] of points.entries()) {
    const x = xForTime(point.timeSeconds);
    const y = yForDepth(point.queueDepth);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();

  if (options.proposedQueueCapacity !== undefined) {
    const y = yForDepth(options.proposedQueueCapacity);
    context.strokeStyle = "#53ba9d";
    context.setLineDash([6, 6]);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.setLineDash([]);
  }

  const peakY = yForDepth(options.peakQueueDepth);
  context.strokeStyle = "#ff6b6b";
  context.setLineDash([4, 4]);
  context.beginPath();
  context.moveTo(padding.left, peakY);
  context.lineTo(width - padding.right, peakY);
  context.stroke();
  context.setLineDash([]);

  if (options.batchMarkerMoments !== undefined) {
    for (const marker of options.batchMarkerMoments) {
      const markerX = xForTime(marker.momentSeconds);

      context.strokeStyle = "#ffa300";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(markerX, padding.top);
      context.lineTo(markerX, height - padding.bottom);
      context.stroke();

      context.fillStyle = "#ffa300";
      context.font = "12px sans-serif";
      context.textAlign = "center";
      context.fillText(marker.letter, markerX, padding.top - 4);
    }
  }

  if (options.selectedMomentSeconds !== undefined) {
    const selectedX = xForTime(options.selectedMomentSeconds);
    const selectedLabel = formatFinishClockTime(options.selectedMomentSeconds);

    context.strokeStyle = "#e8e8e8";
    context.lineWidth = 2;
    context.setLineDash([]);
    context.beginPath();
    context.moveTo(selectedX, padding.top);
    context.lineTo(selectedX, height - padding.bottom);
    context.stroke();

    context.fillStyle = "#e8e8e8";
    context.font = "12px sans-serif";
    context.textAlign = "center";
    context.fillText(selectedLabel, selectedX, padding.top - 4);
  }

  context.fillStyle = "#b8b8c8";
  context.font = "12px sans-serif";
  context.textAlign = "center";
  context.fillText(formatFinishClockTime(minTime), padding.left, height - 10);
  context.fillText(
    formatFinishClockTime(maxTime),
    width - padding.right,
    height - 10,
  );
  context.fillText("Finish time", width / 2, height - 10);
}
