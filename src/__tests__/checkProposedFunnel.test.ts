import { describe, expect, it } from "vitest";
import { checkProposedFunnel } from "../checkProposedFunnel";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";

describe("checkProposedFunnel", () => {
  it("reports sufficient headroom when the proposed funnel exceeds peak queue capacity", () => {
    const result = checkProposedFunnel({
      proposedMetres: 30,
      peakQueueDepth: 10,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      sufficient: true,
      proposedQueueCapacity: 33,
      headroomFinishers: 23,
    });
  });

  it("reports shortfall when the proposed funnel cannot hold the peak queue", () => {
    const result = checkProposedFunnel({
      proposedMetres: 10,
      peakQueueDepth: 10,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toMatchObject({
      sufficient: false,
      proposedQueueCapacity: 6,
      shortfallFinishers: 4,
    });
  });
});
