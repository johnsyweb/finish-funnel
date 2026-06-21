import type { FinisherLaneAssignment } from "./assignFinisherLanes";
import {
  canvasXFromMomentSeconds,
  type ChartTimeRange,
} from "./chartMomentMapping";

export type BatchMarkerMoment = {
  letter: string;
  momentSeconds: number;
};

const DEFAULT_BATCH_HIT_TOLERANCE_PX = 8;

export function batchMarkerMomentsFromAssignments(
  assignments: FinisherLaneAssignment[],
): BatchMarkerMoment[] {
  return assignments
    .filter(
      (
        assignment,
      ): assignment is FinisherLaneAssignment & { batchMarker: string } =>
        assignment.batchMarker !== undefined,
    )
    .map((assignment) => ({
      letter: assignment.batchMarker,
      momentSeconds: assignment.arrivalTimeSeconds,
    }))
    .sort((left, right) => left.momentSeconds - right.momentSeconds);
}

export function adjacentBatchMarkerMoment(
  momentSeconds: number,
  markers: BatchMarkerMoment[],
  direction: "previous" | "next",
): number | undefined {
  const sorted = [...markers].sort(
    (left, right) => left.momentSeconds - right.momentSeconds,
  );

  if (direction === "next") {
    return sorted.find((marker) => marker.momentSeconds > momentSeconds)
      ?.momentSeconds;
  }

  return [...sorted]
    .reverse()
    .find((marker) => marker.momentSeconds < momentSeconds)?.momentSeconds;
}

export function batchMarkerMomentAtCanvasX(
  canvasX: number,
  canvasWidth: number,
  range: ChartTimeRange,
  markers: BatchMarkerMoment[],
  tolerancePx = DEFAULT_BATCH_HIT_TOLERANCE_PX,
): number | undefined {
  for (const marker of markers) {
    const markerX = canvasXFromMomentSeconds(
      marker.momentSeconds,
      canvasWidth,
      range,
    );
    if (Math.abs(canvasX - markerX) <= tolerancePx) {
      return marker.momentSeconds;
    }
  }

  return undefined;
}

export function batchMarkerMomentAtClientX(
  clientX: number,
  canvas: HTMLCanvasElement,
  range: ChartTimeRange,
  markers: BatchMarkerMoment[],
): number | undefined {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.clientWidth / rect.width || 1;
  const canvasX = (clientX - rect.left) * scale;

  return batchMarkerMomentAtCanvasX(
    canvasX,
    canvas.clientWidth,
    range,
    markers,
  );
}
