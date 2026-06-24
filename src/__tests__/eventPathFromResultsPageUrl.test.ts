import { describe, expect, it } from "vitest";
import {
  eventPathFromResultsPageUrl,
  persistedEventSettingsStorageKey,
} from "../eventPathFromResultsPageUrl";

describe("eventPathFromResultsPageUrl", () => {
  it("extracts the event path from a results page URL", () => {
    expect(
      eventPathFromResultsPageUrl(
        "https://www.parkrun.com.au/mernda/results/400/",
      ),
    ).toBe("/mernda/");
    expect(
      eventPathFromResultsPageUrl(
        "https://www.parkrun.org.uk/bushy/results/1095/",
      ),
    ).toBe("/bushy/");
  });

  it("returns undefined for non-results URLs", () => {
    expect(
      eventPathFromResultsPageUrl("https://www.parkrun.com.au/mernda/"),
    ).toBeUndefined();
    expect(eventPathFromResultsPageUrl("not-a-url")).toBeUndefined();
  });
});

describe("persistedEventSettingsStorageKey", () => {
  it("prefixes the event path with a stable namespace", () => {
    expect(persistedEventSettingsStorageKey("/mernda/")).toBe(
      "finish-funnel:settings:/mernda/",
    );
  });
});
