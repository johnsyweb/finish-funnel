import { describe, expect, it } from "vitest";
import {
  buildFinishFunnelColumnCellMarkup,
  buildFinishFunnelDetailedMarkup,
} from "../buildFinishFunnelColumnMarkup";
import type { EventResultAtMoment } from "../eventResultsAtMoment";

const queuedFinisher: EventResultAtMoment = {
  position: 2,
  name: "Sam JONES",
  publishedFinishTime: "18:39",
  state: "queued",
  status: "In queue",
  lane: "2",
  physicalBatch: "A",
  queuePosition: "3",
  timeWaiting: "0:05",
  timeUntilToken: "0:10",
  totalEstimatedQueueingTime: "0:15",
  finishTokensVolunteer: "",
  estimated: false,
};

describe("buildFinishFunnelColumnCellMarkup", () => {
  it("shows compact status and detailed metrics", () => {
    const markup = buildFinishFunnelColumnCellMarkup(queuedFinisher);

    expect(markup).toContain('<div class="compact">In queue</div>');
    expect(markup).toContain("Lane 2");
    expect(markup).toContain("batch A");
    expect(markup).toContain("queue 3");
  });

  it("leaves compact and detailed empty for not-yet-finished finishers", () => {
    const markup = buildFinishFunnelColumnCellMarkup({
      ...queuedFinisher,
      state: "not-yet-finished",
      status: "",
      lane: "",
      physicalBatch: undefined,
      queuePosition: "",
      timeWaiting: "",
      timeUntilToken: "",
      totalEstimatedQueueingTime: "",
    });

    expect(buildFinishFunnelDetailedMarkup).toBeDefined();
    expect(markup).toContain('<div class="compact"></div>');
  });
});
