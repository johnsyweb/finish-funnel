import { laneQueueCapacity } from "./multiLaneFunnel";
import { physicalBatchLabelForIndex } from "./physicalBatchLabel";
import type { FinisherArrival, FinisherSchedule } from "./types";

export type FinisherLaneAssignment = {
  position?: number;
  arrivalTimeSeconds: number;
  lane: number | "overflow";
  physicalBatch?: string;
  batchMarker?: string;
  isBatchMarkerHolder?: boolean;
  estimated?: boolean;
};

type LaneEvent =
  | {
      kind: "handover";
      timeSeconds: number;
      position: number;
    }
  | {
      kind: "arrival";
      timeSeconds: number;
      arrival: FinisherArrival;
    };

export function assignFinisherLanes({
  arrivals,
  finisherSchedules,
  laneCount,
  laneLengthMetres,
  decelerationZoneMetres,
  finisherSpacingMetres,
}: {
  arrivals: FinisherArrival[];
  finisherSchedules: FinisherSchedule[];
  laneCount: number;
  laneLengthMetres: number;
  decelerationZoneMetres: number;
  finisherSpacingMetres: number;
}): FinisherLaneAssignment[] {
  const perLaneCapacity = laneQueueCapacity({
    laneLengthMetres,
    decelerationZoneMetres,
    finisherSpacingMetres,
  });
  const occupancy = Array.from({ length: laneCount }, () => 0);
  const assignmentsByPosition = new Map<number, FinisherLaneAssignment>();
  let physicalBatch = "unnamed";
  let nextNamedBatchIndex = 0;
  let awaitingBatchMarkerHolder = false;
  let currentLane: number | undefined;

  const events: LaneEvent[] = [
    ...finisherSchedules.map((schedule) => ({
      kind: "handover" as const,
      timeSeconds: schedule.tokenHandoverTimeSeconds,
      position: schedule.position ?? -1,
    })),
    ...arrivals.map((arrival) => ({
      kind: "arrival" as const,
      timeSeconds: arrival.timeSeconds,
      arrival,
    })),
  ].sort(compareLaneEvents);

  for (const event of events) {
    if (event.kind === "handover") {
      const assignment = assignmentsByPosition.get(event.position);
      if (assignment && assignment.lane !== "overflow") {
        occupancy[assignment.lane - 1] -= 1;
      }
      continue;
    }

    const { arrival } = event;
    const position = arrival.position ?? -1;
    const previousLane = currentLane;
    const lane = laneForNextArrival({
      currentLane,
      occupancy,
      perLaneCapacity,
    });

    if (lane === undefined) {
      assignmentsByPosition.set(position, {
        position: arrival.position,
        arrivalTimeSeconds: arrival.timeSeconds,
        lane: "overflow",
        estimated: arrival.estimated,
      });
      continue;
    }

    const assignment: FinisherLaneAssignment = {
      position: arrival.position,
      arrivalTimeSeconds: arrival.timeSeconds,
      lane,
      estimated: arrival.estimated,
    };

    if (laneCount > 1) {
      if (previousLane !== undefined && lane !== previousLane) {
        physicalBatch = physicalBatchLabelForIndex(nextNamedBatchIndex);
        nextNamedBatchIndex += 1;
        awaitingBatchMarkerHolder = true;
      }

      assignment.physicalBatch = physicalBatch;
      if (awaitingBatchMarkerHolder) {
        assignment.isBatchMarkerHolder = true;
        assignment.batchMarker = physicalBatch;
        awaitingBatchMarkerHolder = false;
      }
    }

    assignmentsByPosition.set(position, assignment);
    occupancy[lane - 1] += 1;
    currentLane = lane;
  }

  return [...assignmentsByPosition.values()].sort((left, right) => {
    if (left.arrivalTimeSeconds !== right.arrivalTimeSeconds) {
      return left.arrivalTimeSeconds - right.arrivalTimeSeconds;
    }
    return (left.position ?? 0) - (right.position ?? 0);
  });
}

function compareLaneEvents(left: LaneEvent, right: LaneEvent): number {
  if (left.timeSeconds !== right.timeSeconds) {
    return left.timeSeconds - right.timeSeconds;
  }

  if (left.kind !== right.kind) {
    return left.kind === "handover" ? -1 : 1;
  }

  const leftPosition =
    left.kind === "handover" ? left.position : (left.arrival.position ?? 0);
  const rightPosition =
    right.kind === "handover" ? right.position : (right.arrival.position ?? 0);

  return leftPosition - rightPosition;
}

function laneForNextArrival({
  currentLane,
  occupancy,
  perLaneCapacity,
}: {
  currentLane: number | undefined;
  occupancy: number[];
  perLaneCapacity: number;
}): number | undefined {
  if (
    currentLane !== undefined &&
    occupancy[currentLane - 1] < perLaneCapacity
  ) {
    return currentLane;
  }

  return lowestLaneWithCapacity(occupancy, perLaneCapacity);
}

function lowestLaneWithCapacity(
  occupancy: number[],
  perLaneCapacity: number,
): number | undefined {
  for (let lane = 1; lane <= occupancy.length; lane += 1) {
    if (occupancy[lane - 1] < perLaneCapacity) {
      return lane;
    }
  }

  return undefined;
}

export function batchMarkerCardsNeededFromAssignments(
  laneAssignments: FinisherLaneAssignment[],
  laneCount: number,
): number | undefined {
  if (laneCount <= 1) {
    return undefined;
  }

  return laneAssignments.filter(
    (assignment) => assignment.batchMarker !== undefined,
  ).length;
}
