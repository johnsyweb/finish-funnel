import { describe, expect, it } from "vitest";
import { recommendPhysicalFunnelLength } from "../recommendPhysicalFunnelLength";
import {
  DEFAULT_DECELERATION_ZONE_METRES,
  DEFAULT_FINISHER_SPACING_METRES,
} from "../defaults";

describe("recommendPhysicalFunnelLength", () => {
  it("recommends only the deceleration zone when queue capacity is zero", () => {
    const result = recommendPhysicalFunnelLength({
      queueCapacity: 0,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toBe(5);
  });

  it("rounds recommended length up to the nearest whole metre", () => {
    const result = recommendPhysicalFunnelLength({
      queueCapacity: 10,
      decelerationZoneMetres: DEFAULT_DECELERATION_ZONE_METRES,
      finisherSpacingMetres: DEFAULT_FINISHER_SPACING_METRES,
    });

    expect(result).toBe(13);
  });
});
