// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  buildQueueMomentSummaryMarkup,
  queueMomentHeading,
} from "../buildQueueMomentSummaryMarkup";
import type { QueueMomentSummary } from "../queueMomentSummary";

const multiLaneSummary: QueueMomentSummary = {
  queueDepth: 719,
  finishLineBlockedCount: 256,
  lanes: [
    {
      laneNumber: 1,
      queuedCount: 393,
      maxFinishers: 393,
      occupiedMetres: 294.75,
      maxMetres: 295,
      batches: [
        { label: "unnamed", count: 12 },
        { label: "B", count: 381 },
      ],
    },
    {
      laneNumber: 2,
      queuedCount: 326,
      maxFinishers: 393,
      occupiedMetres: 244.5,
      maxMetres: 295,
      batches: [
        { label: "A", count: 180 },
        { label: "C", count: 146 },
      ],
    },
  ],
};

describe("queueMomentHeading", () => {
  it("includes total queue depth in the section heading", () => {
    expect(queueMomentHeading(719)).toBe("Queue at selected moment (719)");
  });
});

describe("buildQueueMomentSummaryMarkup", () => {
  it("renders a definition list with lane utilisation and batches", () => {
    const markup = buildQueueMomentSummaryMarkup(multiLaneSummary);
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.querySelector("dl.queue-moment-summary")).not.toBeNull();
    expect(markup).toContain("Lane 1");
    expect(markup).toContain("393 / 393 finishers");
    expect(markup).toContain("294.8 / 295.0 m");
    expect(markup).toContain("unnamed 12, B 381");
    expect(markup).toContain("A 180, C 146");
  });

  it("shows finish-line blocked finishers when present", () => {
    const markup = buildQueueMomentSummaryMarkup(multiLaneSummary);

    expect(markup).toContain(
      "At finish line (not yet in funnel): 256 finishers",
    );
  });

  it("omits batch nesting for a single-lane summary", () => {
    const markup = buildQueueMomentSummaryMarkup({
      queueDepth: 3,
      lanes: [
        {
          laneNumber: 1,
          queuedCount: 3,
          maxFinishers: 33,
          occupiedMetres: 2.25,
          maxMetres: 25,
          batches: [],
        },
      ],
    });

    expect(markup).not.toContain("queue-lane-batches");
    expect(markup).toContain("3 / 33 finishers");
  });
});
