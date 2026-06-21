import { describe, expect, it } from "vitest";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
  DEFAULT_FINISH_TOKENS_SETTINGS,
} from "../defaults";
import {
  eventResultsAtMoment,
  firstMomentAtPeakQueueDepth,
} from "../eventResultsAtMoment";

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

describe("eventResultsAtMoment", () => {
  it("returns every finisher in finish position order with queued wait metrics", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = eventResultsAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
    });

    expect(result.queueDepth).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.visibleCount).toBe(2);
    expect(result.finishers[0]).toMatchObject({
      position: 1,
      name: "Alex SMITH",
      publishedFinishTime: "18:30",
      state: "queued",
      status: "In queue",
      lane: "1",
      queuePosition: "1",
      timeWaiting: "0:02",
      timeUntilToken: "0:02",
      totalEstimatedQueueingTime: "0:04",
      finishTokensVolunteer: "",
      estimated: false,
    });
    expect(result.finishers[1]).toMatchObject({
      position: 2,
      name: "Sam JONES",
      state: "queued",
      queuePosition: "2",
    });
  });

  it("marks tokened finishers with lane, batch, actual waits, and volunteer label", () => {
    const momentSeconds = 18 * 60 + 30 + 4;

    const result = eventResultsAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
    });

    expect(result.queueDepth).toBe(1);
    expect(result.finishers[0]).toMatchObject({
      position: 1,
      state: "tokened",
      status: "",
      lane: "1",
      queuePosition: "",
      timeWaiting: "0:04",
      timeUntilToken: "",
      totalEstimatedQueueingTime: "0:04",
      finishTokensVolunteer: "Finish Tokens 1",
    });
    expect(result.finishers[1]).toMatchObject({
      position: 2,
      state: "queued",
      status: "In queue",
    });
  });

  it("leaves simulation columns blank for not-yet-finished finishers", () => {
    const result = eventResultsAtMoment({
      finishers: [
        { position: 1, name: "Early RUNNER", time: "18:30" },
        { position: 2, name: "Late RUNNER", time: "19:00" },
      ],
      momentSeconds: 18 * 60 + 30 + 2,
    });

    expect(result.finishers[1]).toMatchObject({
      position: 2,
      state: "not-yet-finished",
      status: "",
      lane: "",
      queuePosition: "",
      finishTokensVolunteer: "",
    });
  });

  it("filters visible rows by name substring without changing total count", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = eventResultsAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
      nameFilter: "jones",
    });

    expect(result.queueDepth).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.visibleCount).toBe(1);
    expect(result.finishers[0]?.name).toBe("Sam JONES");
  });

  it("filters visible rows by finish position", () => {
    const momentSeconds = 18 * 60 + 30 + 2;

    const result = eventResultsAtMoment({
      finishers: [
        { position: 1, name: "Alex SMITH", time: "18:30" },
        { position: 2, name: "Sam JONES", time: "18:30" },
      ],
      momentSeconds,
      finishPositionFilter: 1,
    });

    expect(result.totalCount).toBe(2);
    expect(result.visibleCount).toBe(1);
    expect(result.finishers[0]?.position).toBe(1);
  });

  it("flags Unknown finish times as estimated", () => {
    const momentSeconds = 23 * 60 + 5;

    const result = eventResultsAtMoment({
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

  it("includes lane and physical batch assignments for queued finishers", () => {
    const momentSeconds = 18 * 60 + 30 + 1;
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = eventResultsAtMoment({
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
      physicalBatch: "unnamed",
    });
    expect(result.finishers[2]).toMatchObject({
      position: 3,
      lane: "2",
      physicalBatch: "A",
      isBatchMarkerHolder: true,
    });
  });

  it("marks finishers waiting at the finish line before funnel admission", () => {
    const momentSeconds = 23 * 60 + 1;
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = eventResultsAtMoment({
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

    const fifthFinisher = result.finishers.find(
      (finisher) => finisher.position === 5,
    );

    expect(fifthFinisher).toMatchObject({
      state: "finish-line-blocked",
      status: "At finish line",
      lane: "",
      queuePosition: "",
      finishTokensVolunteer: "",
    });
  });

  it("assigns lanes instead of overflow when finish-line backup delays admission", () => {
    const momentSeconds = 23 * 60 + 5;
    const laneLengthMetres =
      DEFAULT_DECELERATION_ZONE_METRES + 2 * DEFAULT_FINISHER_SPACING_METRES;

    const result = eventResultsAtMoment({
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

    const fifthFinisher = result.finishers.find(
      (finisher) => finisher.position === 5,
    );

    expect(fifthFinisher).toBeDefined();
    expect(fifthFinisher?.lane).not.toBe("Overflow");
  });
});
