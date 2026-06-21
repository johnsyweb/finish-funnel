import { describe, expect, it } from "vitest";
import {
  finishLineBlockedCountAtMoment,
  formatQueueZoneMetres,
  physicalBatchSortIndex,
  queueMomentSummaryFromAssignments,
} from "../queueMomentSummary";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";

const laneLengthMetres =
  DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

describe("physicalBatchSortIndex", () => {
  it("orders unnamed before named batches", () => {
    expect(physicalBatchSortIndex("unnamed")).toBeLessThan(
      physicalBatchSortIndex("A"),
    );
  });
});

describe("finishLineBlockedCountAtMoment", () => {
  it("counts finishers waiting at the finish line before funnel admission", () => {
    expect(
      finishLineBlockedCountAtMoment({
        publishedArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 1 },
          { position: 3, timeSeconds: 2 },
        ],
        effectiveArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 1 },
          { position: 3, timeSeconds: 4 },
        ],
        momentSeconds: 2,
      }),
    ).toBe(1);
  });
});

describe("queueMomentSummaryFromAssignments", () => {
  it("summarises lane utilisation and batches for queued finishers", () => {
    const summary = queueMomentSummaryFromAssignments({
      queuedPositions: [1, 2, 3, 4],
      laneAssignments: [
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
          isBatchMarkerHolder: true,
          batchMarker: "A",
        },
        {
          position: 4,
          arrivalTimeSeconds: 5,
          lane: 2,
          physicalBatch: "A",
        },
      ],
      laneCount: 2,
      laneLengthMetres,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(summary.queueDepth).toBe(4);
    expect(summary.lanes[0]).toMatchObject({
      laneNumber: 1,
      queuedCount: 2,
      maxFinishers: 2,
      batches: [{ label: "unnamed", count: 2 }],
    });
    expect(summary.lanes[1]).toMatchObject({
      laneNumber: 2,
      queuedCount: 2,
      maxFinishers: 2,
      batches: [{ label: "A", count: 2 }],
    });
  });

  it("omits batch nesting for a single lane", () => {
    const summary = queueMomentSummaryFromAssignments({
      queuedPositions: [1],
      laneAssignments: [
        {
          position: 1,
          arrivalTimeSeconds: 0,
          lane: 1,
          physicalBatch: "unnamed",
        },
      ],
      laneCount: 1,
      laneLengthMetres: 30,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(summary.lanes[0]?.batches).toEqual([]);
  });
});

describe("formatQueueZoneMetres", () => {
  it("formats metres to one decimal place", () => {
    expect(formatQueueZoneMetres(294.75)).toBe("294.8");
  });
});
