// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildAugmentedResultsTableFromEventResults } from "../buildQueueVisualisationMarkup";
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

describe("buildAugmentedResultsTableFromEventResults", () => {
  it("renders a parkrun-style table with a Finish funnel column", () => {
    const markup = buildAugmentedResultsTableFromEventResults([sampleFinisher]);
    const document = new DOMParser().parseFromString(markup, "text/html");
    const headers = [...document.querySelectorAll("th")].map(
      (cell) => cell.textContent,
    );

    expect(headers).toEqual([
      "Position",
      "parkrunner",
      "Gender",
      "Age Group",
      "Group",
      "Time",
      "Finish funnel",
    ]);
    expect(markup).toContain('class="Results-table Results-table--compact');
    expect(markup).toContain("In queue");
    expect(markup).toContain("finish-funnel-batch-card");
  });

  it("uses detailed display mode when requested", () => {
    const markup = buildAugmentedResultsTableFromEventResults(
      [sampleFinisher],
      {
        displayMode: "detailed",
      },
    );

    expect(markup).toContain("Results-table--detailed");
    expect(markup).toContain("Lane 2");
    expect(markup).toContain("batch B");
  });
});
