import { formatFinishClockTime } from "./formatFinishClockTime";

export type QueueChartPoint = {
  timeSeconds: number;
  queueDepth: number;
};

export type QueueChartOptions = {
  peakQueueDepth: number;
  proposedQueueCapacity?: number;
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

  const padding = { top: 16, right: 16, bottom: 36, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const minTime = points[0].timeSeconds;
  const maxTime = points[points.length - 1].timeSeconds;
  const maxDepth = Math.max(
    options.peakQueueDepth,
    options.proposedQueueCapacity ?? 0,
    1,
  );

  const xForTime = (timeSeconds: number) =>
    padding.left +
    ((timeSeconds - minTime) / (maxTime - minTime || 1)) * plotWidth;
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
