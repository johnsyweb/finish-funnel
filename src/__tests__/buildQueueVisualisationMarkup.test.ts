// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  buildEventResultsTableMarkup,
  parseQueueSearchFilter,
} from "../buildQueueVisualisationMarkup";
import type { EventResultAtMoment } from "../eventResultsAtMoment";

const sampleFinisher: EventResultAtMoment = {
  position: 1000,
  name: "Carmen PALMER",
  publishedFinishTime: "31:52",
  state: "queued",
  status: "In queue",
  lane: "2",
  physicalBatch: "B",
  isBatchMarkerHolder: true,
  queuePosition: "1",
  timeWaiting: "0:02",
  timeUntilToken: "0:02",
  totalEstimatedQueueingTime: "0:04",
  finishTokensVolunteer: "",
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

describe("buildEventResultsTableMarkup", () => {
  it("renders an accessible table with all event result columns", () => {
    const markup = buildEventResultsTableMarkup([sampleFinisher], {
      totalCount: 1,
      visibleCount: 1,
    });
    const document = new DOMParser().parseFromString(markup, "text/html");
    const headers = [...document.querySelectorAll("th")].map(
      (cell) => cell.textContent,
    );

    expect(headers).toEqual([
      "Finish position",
      "Name",
      "Finish time",
      "Status",
      "Lane",
      "Batch",
      "Queue position",
      "Time waiting",
      "Time until token",
      "Total estimated queueing time",
      "Finish Tokens volunteer",
    ]);
    expect(document.querySelector("caption")?.textContent).toContain(
      "Event results at the selected moment",
    );
    expect(markup).toContain("Carmen PALMER");
    expect(markup).toContain("In queue");
    expect(markup).toContain("queue-batch-card");
  });

  it("shows Finish Tokens volunteer for tokened finishers", () => {
    const markup = buildEventResultsTableMarkup(
      [
        {
          ...sampleFinisher,
          state: "tokened",
          status: "",
          queuePosition: "",
          finishTokensVolunteer: "Finish Tokens 2",
        },
      ],
      { totalCount: 1, visibleCount: 1 },
    );

    expect(markup).toContain("Finish Tokens 2");
  });

  it("shows At finish line in the status column", () => {
    const markup = buildEventResultsTableMarkup(
      [
        {
          ...sampleFinisher,
          state: "finish-line-blocked",
          status: "At finish line",
          lane: "",
          queuePosition: "",
        },
      ],
      { totalCount: 1, visibleCount: 1 },
    );

    expect(markup).toContain("At finish line");
  });

  it("shows an estimated badge for Unknown finish times", () => {
    const markup = buildEventResultsTableMarkup(
      [
        {
          ...sampleFinisher,
          publishedFinishTime: "Unknown",
          estimated: true,
        },
      ],
      { totalCount: 1, visibleCount: 1 },
    );

    expect(markup).toContain("Estimated");
  });

  it("summarises filtered rows in the caption", () => {
    const markup = buildEventResultsTableMarkup([sampleFinisher], {
      totalCount: 10,
      visibleCount: 1,
    });

    expect(markup).toContain("1 of 10 finishers shown");
  });
});
