import {
  batchMarkerCardsNeededFromAssignments,
  type FinisherLaneAssignment,
} from "./assignFinisherLanes";
import { laneQueueZoneMetres } from "./finisherSpacingLimits";
import { physicalBatchSortIndex } from "./physicalBatchLabel";
import { laneQueueCapacity } from "./multiLaneFunnel";
import type { FinisherArrival } from "./types";

export type QueueMomentLaneBatchSummary = {
  label: string;
  count: number;
};

export type QueueMomentLaneSummary = {
  laneNumber: number;
  queuedCount: number;
  maxFinishers: number;
  occupiedMetres: number;
  maxMetres: number;
  batches: QueueMomentLaneBatchSummary[];
};

export type QueueMomentSummary = {
  queueDepth: number;
  batchMarkerCardsNeeded?: number;
  finishLineBlockedCount?: number;
  lanes: QueueMomentLaneSummary[];
};

export { physicalBatchSortIndex } from "./physicalBatchLabel";

export function finishLineBlockedCountAtMoment({
  publishedArrivals,
  effectiveArrivals,
  momentSeconds,
}: {
  publishedArrivals: FinisherArrival[];
  effectiveArrivals: FinisherArrival[];
  momentSeconds: number;
}): number {
  const effectiveByPosition = new Map(
    effectiveArrivals.map((arrival) => [arrival.position ?? -1, arrival]),
  );

  return publishedArrivals.filter((publishedArrival) => {
    const effectiveArrival = effectiveByPosition.get(
      publishedArrival.position ?? -1,
    );
    if (!effectiveArrival) {
      return false;
    }

    return (
      publishedArrival.timeSeconds <= momentSeconds &&
      effectiveArrival.timeSeconds > momentSeconds
    );
  }).length;
}

export function queueMomentSummaryFromAssignments({
  queuedPositions,
  laneAssignments,
  laneCount,
  laneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
  finishLineBlockedCount,
}: {
  queuedPositions: number[];
  laneAssignments: FinisherLaneAssignment[];
  laneCount: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
  finishLineBlockedCount?: number;
}): QueueMomentSummary {
  const assignmentByPosition = new Map(
    laneAssignments.map((assignment) => [assignment.position, assignment]),
  );
  const maxFinishers = laneQueueCapacity({
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const maxMetres = laneQueueZoneMetres({
    laneLengthMetres,
    decelerationZoneMetres,
  });

  const lanes: QueueMomentLaneSummary[] = [];

  for (let laneNumber = 1; laneNumber <= laneCount; laneNumber += 1) {
    const queuedInLane = queuedPositions
      .map((position) => assignmentByPosition.get(position))
      .filter(
        (assignment): assignment is FinisherLaneAssignment =>
          assignment !== undefined && assignment.lane === laneNumber,
      );
    const batchCounts = new Map<string, number>();

    for (const assignment of queuedInLane) {
      if (assignment.physicalBatch === undefined) {
        continue;
      }

      batchCounts.set(
        assignment.physicalBatch,
        (batchCounts.get(assignment.physicalBatch) ?? 0) + 1,
      );
    }

    const batches = [...batchCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort(
        (left, right) =>
          physicalBatchSortIndex(left.label) -
          physicalBatchSortIndex(right.label),
      );

    lanes.push({
      laneNumber,
      queuedCount: queuedInLane.length,
      maxFinishers,
      occupiedMetres: queuedInLane.length * finisherSpacingMetres,
      maxMetres,
      batches: laneCount > 1 ? batches : [],
    });
  }

  return {
    queueDepth: queuedPositions.length,
    batchMarkerCardsNeeded: batchMarkerCardsNeededFromAssignments(
      laneAssignments,
      laneCount,
    ),
    finishLineBlockedCount:
      finishLineBlockedCount === undefined || finishLineBlockedCount === 0
        ? undefined
        : finishLineBlockedCount,
    lanes,
  };
}

export function formatQueueZoneMetres(metres: number): string {
  return metres.toFixed(1);
}
