import { describe, expect, it } from "vitest";
import { assignFinisherLanes } from "../assignFinisherLanes";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";
import type { FinisherArrival, FinisherSchedule } from "../types";

const twoFinisherLaneLengthMetres =
  DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

function layoutSettings(laneCount = 2) {
  return {
    laneCount,
    laneLengthMetres: twoFinisherLaneLengthMetres,
    decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
    finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
  };
}

function schedulesFromArrivals(
  arrivals: FinisherArrival[],
  secondsPerToken = 4,
): FinisherSchedule[] {
  const sorted = [...arrivals].sort(
    (left, right) => left.timeSeconds - right.timeSeconds,
  );

  return sorted.map((arrival, index) => ({
    position: arrival.position,
    arrivalTimeSeconds: arrival.timeSeconds,
    tokenHandoverTimeSeconds:
      sorted[0].timeSeconds + (index + 1) * secondsPerToken,
    estimated: arrival.estimated,
  }));
}

describe("assignFinisherLanes", () => {
  it("does not assign a batch marker before the first lane-fill switch", () => {
    const arrivals: FinisherArrival[] = [{ timeSeconds: 0, position: 1 }];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules: schedulesFromArrivals(arrivals),
      ...layoutSettings(),
    });

    expect(assignments[0]).toMatchObject({
      position: 1,
      lane: 1,
      physicalBatch: "unnamed",
    });
    expect(assignments[0]?.isBatchMarkerHolder).toBeUndefined();
  });

  it("assigns A when lane 1 fills and the first finisher enters lane 2", () => {
    const arrivals: FinisherArrival[] = [
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 1, position: 2 },
      { timeSeconds: 2, position: 3 },
    ];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules: schedulesFromArrivals(arrivals),
      ...layoutSettings(),
    });

    expect(assignments).toEqual([
      {
        position: 1,
        arrivalTimeSeconds: 0,
        lane: 1,
        physicalBatch: "unnamed",
      },
      {
        position: 2,
        arrivalTimeSeconds: 1,
        lane: 1,
        physicalBatch: "unnamed",
      },
      {
        position: 3,
        arrivalTimeSeconds: 2,
        lane: 2,
        physicalBatch: "A",
        batchMarker: "A",
        isBatchMarkerHolder: true,
      },
    ]);
  });

  it("assigns B when lane 2 fills and the first new finisher enters lane 1", () => {
    const arrivals: FinisherArrival[] = [
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 1, position: 2 },
      { timeSeconds: 2, position: 3 },
      { timeSeconds: 3, position: 4 },
      { timeSeconds: 10, position: 5 },
    ];
    const finisherSchedules: FinisherSchedule[] = [
      { position: 1, arrivalTimeSeconds: 0, tokenHandoverTimeSeconds: 4 },
      { position: 2, arrivalTimeSeconds: 1, tokenHandoverTimeSeconds: 8 },
      { position: 3, arrivalTimeSeconds: 2, tokenHandoverTimeSeconds: 12 },
      { position: 4, arrivalTimeSeconds: 3, tokenHandoverTimeSeconds: 16 },
      { position: 5, arrivalTimeSeconds: 10, tokenHandoverTimeSeconds: 20 },
    ];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules,
      ...layoutSettings(),
    });

    expect(assignments[2]).toMatchObject({
      position: 3,
      lane: 2,
      physicalBatch: "A",
      batchMarker: "A",
      isBatchMarkerHolder: true,
    });
    expect(assignments[4]).toMatchObject({
      position: 5,
      lane: 1,
      physicalBatch: "B",
      batchMarker: "B",
      isBatchMarkerHolder: true,
    });
  });

  it("stays on the current lane while it still has capacity", () => {
    const arrivals: FinisherArrival[] = [
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 1, position: 2 },
      { timeSeconds: 2, position: 3 },
      { timeSeconds: 5, position: 4 },
    ];
    const finisherSchedules: FinisherSchedule[] = [
      { position: 1, arrivalTimeSeconds: 0, tokenHandoverTimeSeconds: 4 },
      { position: 2, arrivalTimeSeconds: 1, tokenHandoverTimeSeconds: 8 },
      { position: 3, arrivalTimeSeconds: 2, tokenHandoverTimeSeconds: 12 },
      { position: 4, arrivalTimeSeconds: 5, tokenHandoverTimeSeconds: 16 },
    ];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules,
      ...layoutSettings(),
    });

    expect(assignments[3]).toMatchObject({
      position: 4,
      lane: 2,
      physicalBatch: "A",
    });
    expect(assignments[3]?.isBatchMarkerHolder).toBeUndefined();
  });

  it("assigns no batch markers when only one lane is configured", () => {
    const arrivals: FinisherArrival[] = [
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 1, position: 2 },
      { timeSeconds: 2, position: 3 },
    ];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules: schedulesFromArrivals(arrivals),
      ...layoutSettings(1),
    });

    expect(
      assignments.every((assignment) => assignment.batchMarker === undefined),
    ).toBe(true);
  });

  it("assigns overflow when every lane is full at arrival time", () => {
    const arrivals: FinisherArrival[] = [
      { timeSeconds: 0, position: 1 },
      { timeSeconds: 0.5, position: 2 },
      { timeSeconds: 1, position: 3 },
      { timeSeconds: 1.5, position: 4 },
      { timeSeconds: 2, position: 5 },
    ];
    const finisherSchedules: FinisherSchedule[] = [
      { position: 1, arrivalTimeSeconds: 0, tokenHandoverTimeSeconds: 4 },
      { position: 2, arrivalTimeSeconds: 0.5, tokenHandoverTimeSeconds: 8 },
      { position: 3, arrivalTimeSeconds: 1, tokenHandoverTimeSeconds: 12 },
      { position: 4, arrivalTimeSeconds: 1.5, tokenHandoverTimeSeconds: 16 },
      { position: 5, arrivalTimeSeconds: 2, tokenHandoverTimeSeconds: 20 },
    ];

    const assignments = assignFinisherLanes({
      arrivals,
      finisherSchedules,
      ...layoutSettings(),
    });

    expect(assignments[4]).toMatchObject({
      position: 5,
      lane: "overflow",
    });
    expect(assignments[4]).not.toHaveProperty("batchMarker");
  });
});
