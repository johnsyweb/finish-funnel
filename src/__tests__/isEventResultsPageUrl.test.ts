import { describe, expect, it } from "vitest";
import { isEventResultsPageUrl } from "../isEventResultsPageUrl";

describe("isEventResultsPageUrl", () => {
  it("matches parkrun event results pages", () => {
    expect(
      isEventResultsPageUrl("https://www.parkrun.org.uk/bushy/results/1095/"),
    ).toBe(true);
    expect(
      isEventResultsPageUrl(
        "https://www.parkrun.com.au/albertmelbourne/results/2026-06-13/",
      ),
    ).toBe(true);
  });

  it("rejects non-results parkrun pages", () => {
    expect(isEventResultsPageUrl("https://www.parkrun.org.uk/bushy/")).toBe(
      false,
    );
  });
});
