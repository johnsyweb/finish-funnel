import { describe, expect, it } from "vitest";
import { resolveCallout } from "../resolveCallout";

describe("resolveCallout", () => {
  it("shows funnel-not-required for quiet events", () => {
    expect(
      resolveCallout({
        funnelNotRequired: true,
        combinedLaneCapacity: 33,
        peakQueueDepth: 3,
      }),
    ).toEqual({
      hidden: false,
      className: "callout",
      text: "A roped-off funnel may not be needed for this event.",
    });
  });

  it("shows finish-line backup warning when combined capacity is below peak", () => {
    expect(
      resolveCallout({
        funnelNotRequired: false,
        combinedLaneCapacity: 786,
        peakQueueDepth: 1042,
      }),
    ).toEqual({
      hidden: false,
      className: "callout warn",
      text: "The queue would back over the finish line at peak. Finish-line backup is not yet modelled.",
    });
  });

  it("hides the finish-line backup warning when backup is modelled", () => {
    expect(
      resolveCallout({
        funnelNotRequired: false,
        combinedLaneCapacity: 786,
        peakQueueDepth: 786,
        finishLineBackupModelled: true,
      }),
    ).toEqual({ hidden: true });
  });

  it("hides the callout when the layout is sufficient and a funnel is needed", () => {
    expect(
      resolveCallout({
        funnelNotRequired: false,
        combinedLaneCapacity: 800,
        peakQueueDepth: 700,
      }),
    ).toEqual({ hidden: true });
  });
});
