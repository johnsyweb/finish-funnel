import { describe, expect, it } from "vitest";
import { DEFAULT_FIXTURE_ID } from "../defaults";
import { orderFixturesForDisplay } from "../orderFixturesForDisplay";

describe("orderFixturesForDisplay", () => {
  it("defaults to the quiet Mernda fixture", () => {
    expect(DEFAULT_FIXTURE_ID).toBe("mernda-400");
  });

  it("lists the default fixture first in the selector", () => {
    const ordered = orderFixturesForDisplay([
      { id: "bushy-1095", eventName: "Bushy parkrun" },
      { id: "mernda-400", eventName: "Mernda parkrun" },
    ]);

    expect(ordered.map((fixture) => fixture.id)).toEqual([
      "mernda-400",
      "bushy-1095",
    ]);
  });
});
