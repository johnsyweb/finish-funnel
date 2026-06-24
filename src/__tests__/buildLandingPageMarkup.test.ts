import { describe, expect, it } from "vitest";
import {
  buildLandingPageMarkup,
  USERSCRIPT_NAME,
} from "../buildLandingPageMarkup";
import { DEFAULT_USERSCRIPT_DOWNLOAD_URL, SUPPORT_URL } from "../siteConstants";

describe("buildLandingPageMarkup", () => {
  it("includes install CTA with script-install classes", () => {
    const markup = buildLandingPageMarkup();

    expect(markup).toContain('id="header"');
    expect(markup).toContain('id="content"');
    expect(markup).toContain('id="footer"');
    expect(markup).toContain('class="breadcrumbs"');
    expect(markup).toContain('class="script-install-cta"');
    expect(markup).toContain('class="script-install-button"');
    expect(markup).toContain(`Install ${USERSCRIPT_NAME}`);
    expect(markup).toContain(DEFAULT_USERSCRIPT_DOWNLOAD_URL);
  });

  it("follows the landing page section order", () => {
    const markup = buildLandingPageMarkup();
    const content = markup.slice(markup.indexOf('id="content"'));
    const about = content.indexOf('id="about-heading"');
    const privacy = content.indexOf('id="privacy-heading"');
    const gettingStarted = content.indexOf('id="getting-started-heading"');
    const screenshot = content.indexOf('id="screenshot-heading"');
    const install = content.indexOf('id="install-heading"');
    const support = content.indexOf('id="support-heading"');

    expect(about).toBeLessThan(privacy);
    expect(privacy).toBeLessThan(gettingStarted);
    expect(gettingStarted).toBeLessThan(screenshot);
    expect(screenshot).toBeLessThan(install);
    expect(install).toBeLessThan(support);
  });

  it("includes beta callout, why, and support links", () => {
    const markup = buildLandingPageMarkup();

    expect(markup).toContain("landing-lead");
    expect(markup).toContain("model queue depth");
    expect(markup).toContain("beta-callout");
    expect(markup).toContain("cannot overtake");
    expect(markup).toContain("little practical guidance");
    expect(markup).not.toContain(
      "handed out in position order during busy finish periods",
    );
    expect(markup).toContain(SUPPORT_URL);
    expect(markup).toContain("Testers and corrections are welcome");
  });

  it("includes version facts when provided", () => {
    const markup = buildLandingPageMarkup({
      version: "0.2.0",
      updatedDate: "2026-06-24",
    });

    expect(markup).toContain('class="script-facts"');
    expect(markup).toContain("Version 0.2.0");
    expect(markup).toContain('datetime="2026-06-24"');
  });

  it("allows overriding the install URL", () => {
    const markup = buildLandingPageMarkup({
      installUrl: "https://example.test/finish-funnel.user.js",
    });

    expect(markup).toContain("https://example.test/finish-funnel.user.js");
  });
});
