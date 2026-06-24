import type { EventQueueTimeSummary } from "./eventQueueTimeSummary";
import { formatFinishClockTime } from "./formatFinishClockTime";

export function buildEventQueueTimeSummaryLine(
  summary: EventQueueTimeSummary,
): string {
  return `Queue time: ${formatFinishClockTime(summary.maxSeconds)} max · ${formatFinishClockTime(summary.meanSeconds)} mean · ${formatFinishClockTime(summary.medianSeconds)} median`;
}

export function buildPeakQueueCapacityLine(peakQueueDepth: number): string {
  return `Peak queue capacity: ${peakQueueDepth} finishers`;
}
