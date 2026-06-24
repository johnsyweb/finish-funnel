import { describe, expect, it } from "vitest";
import {
  buildSiteFooterMarkup,
  buildSiteHeaderMarkup,
} from "../buildSiteChromeMarkup";

describe("buildSiteChromeMarkup", () => {
  it("renders breadcrumbs and page title in the header", () => {
    const header = buildSiteHeaderMarkup();

    expect(header).toContain('id="header"');
    expect(header).toContain('class="breadcrumbs"');
    expect(header).toContain('href="https://www.johnsy.com/"');
    expect(header).toContain(
      'href="https://www.johnsy.com/parkrun-utilities/"',
    );
    expect(header).toContain('aria-current="page"');
    expect(header).toContain("<h1>Finish Funnel</h1>");
  });

  it("renders the standard site footer", () => {
    const footer = buildSiteFooterMarkup();

    expect(footer).toContain('id="footer"');
    expect(footer).toContain("Not officially associated with parkrun");
    expect(footer).toContain("github.com/johnsyweb/finish-funnel");
  });
});
