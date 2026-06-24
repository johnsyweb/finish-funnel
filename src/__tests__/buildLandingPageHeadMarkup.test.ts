import { describe, expect, it } from "vitest";
import { buildLandingPageHeadMarkup } from "../buildLandingPageHeadMarkup";
import { OG_IMAGE_URL, SITE_HOMEPAGE } from "../siteConstants";

describe("buildLandingPageHeadMarkup", () => {
  it("includes Foretoken-style SEO and social metadata", () => {
    const head = buildLandingPageHeadMarkup({ version: "0.2.0" });

    expect(head).toContain(`<link rel="canonical" href="${SITE_HOMEPAGE}" />`);
    expect(head).toContain('<meta property="og:type" content="website" />');
    expect(head).toContain(
      `<meta property="og:image" content="${OG_IMAGE_URL}" />`,
    );
    expect(head).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    );
    expect(head).toContain('"@type":"SoftwareApplication"');
    expect(head).toContain('"@type":"BreadcrumbList"');
    expect(head).toContain('"softwareVersion":"0.2.0"');
  });
});
