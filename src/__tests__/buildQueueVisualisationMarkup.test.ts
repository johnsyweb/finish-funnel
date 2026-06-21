// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  buildQueuePaginationMarkup,
  buildQueueTableMarkup,
  parseQueueSearchFilter,
  queuePageCount,
} from "../buildQueueVisualisationMarkup";
import type { QueuedFinisherAtMoment } from "../queuedFinishersAtMoment";

const sampleFinisher: QueuedFinisherAtMoment = {
  position: 1000,
  name: "Carmen PALMER",
  publishedFinishTime: "31:52",
  lane: "2",
  physicalBatch: "B",
  isBatchMarkerHolder: true,
  queuePosition: 1,
  timeWaiting: "0:02",
  timeUntilToken: "0:02",
  totalEstimatedQueueingTime: "0:04",
  estimated: false,
};

describe("parseQueueSearchFilter", () => {
  it("treats numeric input as a finish position filter", () => {
    expect(parseQueueSearchFilter("1000")).toEqual({
      finishPositionFilter: 1000,
    });
  });

  it("treats text input as a name filter", () => {
    expect(parseQueueSearchFilter("palmer")).toEqual({ nameFilter: "palmer" });
  });

  it("returns no filter for blank search text", () => {
    expect(parseQueueSearchFilter("   ")).toEqual({});
  });
});

describe("queuePageCount", () => {
  it("returns at least one page even when the queue is empty", () => {
    expect(queuePageCount(0, 25)).toBe(1);
    expect(queuePageCount(26, 25)).toBe(2);
  });
});

describe("buildQueueTableMarkup", () => {
  it("renders an accessible table with all queue columns", () => {
    const markup = buildQueueTableMarkup([sampleFinisher]);
    const document = new DOMParser().parseFromString(markup, "text/html");
    const headers = [...document.querySelectorAll("th")].map(
      (cell) => cell.textContent,
    );

    expect(headers).toEqual([
      "Finish position",
      "Name",
      "Finish time",
      "Lane",
      "Batch",
      "Queue position",
      "Time waiting",
      "Time until token",
      "Total estimated queueing time",
    ]);
    expect(document.querySelector("caption")?.textContent).toContain(
      "Queued finishers at the selected moment",
    );
    expect(markup).toContain("Carmen PALMER");
    expect(markup).toContain("queue-batch-card");
    expect(markup).toContain("batch marker holder");
  });

  it("shows the physical batch without a card indicator for other finishers in the batch", () => {
    const markup = buildQueueTableMarkup([
      {
        ...sampleFinisher,
        isBatchMarkerHolder: false,
      },
    ]);

    expect(markup).toContain(">B</td>");
    expect(markup).not.toContain("queue-batch-card");
  });

  it("leaves the batch cell blank when no physical batch applies", () => {
    const markup = buildQueueTableMarkup([
      {
        ...sampleFinisher,
        physicalBatch: undefined,
        isBatchMarkerHolder: undefined,
      },
    ]);

    expect(markup).toContain(">2</td>");
    expect(markup).not.toContain(">B</td>");
  });

  it("shows Overflow in the lane column without a batch letter", () => {
    const markup = buildQueueTableMarkup([
      {
        ...sampleFinisher,
        lane: "Overflow",
        physicalBatch: undefined,
        isBatchMarkerHolder: undefined,
      },
    ]);

    expect(markup).toContain("Overflow");
  });

  it("shows an estimated badge for Unknown finish times", () => {
    const markup = buildQueueTableMarkup([
      {
        ...sampleFinisher,
        publishedFinishTime: "Unknown",
        estimated: true,
      },
    ]);

    expect(markup).toContain("Estimated");
  });
});

describe("buildQueuePaginationMarkup", () => {
  it("renders keyboard-focusable previous and next page controls", () => {
    const markup = buildQueuePaginationMarkup({
      pageIndex: 1,
      pageCount: 3,
      pageSize: 25,
      totalCount: 60,
    });

    expect(markup).toContain('id="queue-prev-page"');
    expect(markup).toContain('id="queue-next-page"');
    expect(markup).toContain("Page 2 of 3");
    expect(markup).toContain('aria-label="Queue pagination"');
  });
});
