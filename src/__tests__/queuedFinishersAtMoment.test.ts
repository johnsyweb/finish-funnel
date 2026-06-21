import { describe, expect, it } from "vitest";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
} from "../defaults";
import {
  firstMomentAtPeakQueueDepth,
  queuedFinishersAtMoment,
} from "../queuedFinishersAtMoment";

describe("firstMomentAtPeakQueueDepth", () => {
  it("returns the earliest instant peak queue depth is reached", () => {
    const moment = firstMomentAtPeakQueueDepth(
      [
        { timeSeconds: 10, queueDepth: 1 },
        { timeSeconds: 20, queueDepth: 3 },
        { timeSeconds: 30, queueDepth: 3 },
      ],
      3,
    );

    expect(moment).toBe(20);
  });
});

describe("queuedFinishersAtMoment", () => {
  it("returns queued finishers at the selected moment front first with wait metrics", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
    });

    expect(result.queueDepth).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.finishers).toEqual([
      {
        position: 1,
        name: "Alex SMITH",
        publishedFinishTime: "18:30",
        lane: "1",
        queuePosition: 1,
        timeWaiting: "0:02",
        timeUntilToken: "0:02",
        totalEstimatedQueueingTime: "0:04",
        estimated: false,
      },
      {
        position: 2,
        name: "Sam JONES",
        publishedFinishTime: "18:30",
        lane: "1",
        queuePosition: 2,
        timeWaiting: "0:01",
        timeUntilToken: "0:06",
        totalEstimatedQueueingTime: "0:07",
        estimated: false,
      },
    ]);
  });

  it("excludes finishers who have already received a finish token at the selected moment", () => {
    const momentSeconds = 18 * 60 + 30 + 4;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
    });

    expect(result.queueDepth).toBe(1);
    expect(result.finishers).toHaveLength(1);
    expect(result.finishers[0]?.name).toBe("Sam JONES");
    expect(result.finishers[0]?.queuePosition).toBe(1);
  });

  it("paginates the queued finisher list", () => {
    const momentSeconds = 23 * 60 + 1;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "First", time: "23:00" },
        { position: 2, name: "Second", time: "23:00" },
        { position: 3, name: "Third", time: "23:00" },
      ],
      momentSeconds,
      offset: 1,
      limit: 1,
    });

    expect(result.queueDepth).toBe(3);
    expect(result.totalCount).toBe(3);
    expect(result.finishers).toHaveLength(1);
    expect(result.finishers[0]).toMatchObject({
      name: "Second",
      queuePosition: 2,
    });
  });

  it("filters queued finishers by name substring", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
      nameFilter: "jones",
    });

    expect(result.queueDepth).toBe(2);
    expect(result.totalCount).toBe(1);
    expect(result.finishers[0]?.name).toBe("Sam JONES");
  });

  it("filters queued finishers by finish position", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
      finishPositionFilter: 1,
    });

    expect(result.totalCount).toBe(1);
    expect(result.finishers[0]?.position).toBe(1);
  });

  it("flags Unknown finish times as estimated in the queue list", () => {
    const momentSeconds = 23 * 60 + 5;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "Known RUNNER", time: "23:00" },
        { position: 2, name: "Unknown RUNNER", time: "Unknown" },
        { position: 3, name: "Later RUNNER", time: "23:30" },
      ],
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      momentSeconds,
      finishPositionFilter: 2,
    });

    expect(result.finishers[0]).toMatchObject({
      name: "Unknown RUNNER",
      publishedFinishTime: "Unknown",
      estimated: true,
    });
  });

  it("includes lane and batch marker assignments for queued finishers", () => {
    const momentSeconds = 18 * 60 + 30 + 1;
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "First", time: "18:30" },
        { position: 2, name: "Second", time: "18:30" },
        { position: 3, name: "Third", time: "18:30" },
      ],
      momentSeconds,
      laneCount: 2,
      laneLengthMetres,
    });

    expect(result.finishers[0]).toMatchObject({
      position: 1,
      lane: "1",
    });
    expect(result.finishers[0]?.batchMarker).toBeUndefined();
    expect(result.finishers[1]).toMatchObject({
      position: 2,
      lane: "1",
    });
    expect(result.finishers[1]?.batchMarker).toBeUndefined();
    expect(result.finishers[2]).toMatchObject({
      position: 3,
      lane: "2",
      batchMarker: "A",
    });
  });

  it("shows overflow in the lane column when the proposed layout is full", () => {
    const momentSeconds = 23 * 60 + 1;
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = queuedFinishersAtMoment({
      finishers: [
        { position: 1, name: "First", time: "23:00" },
        { position: 2, name: "Second", time: "23:00" },
        { position: 3, name: "Third", time: "23:00" },
        { position: 4, name: "Fourth", time: "23:00" },
        { position: 5, name: "Fifth", time: "23:00" },
      ],
      momentSeconds,
      laneCount: 2,
      laneLengthMetres,
    });

    const overflowFinisher = result.finishers.find(
      (finisher) => finisher.position === 5,
    );

    expect(overflowFinisher).toMatchObject({
      lane: "Overflow",
    });
    expect(overflowFinisher?.batchMarker).toBeUndefined();
  });
});
