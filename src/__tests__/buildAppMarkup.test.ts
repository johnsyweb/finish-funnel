// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildAppMarkup } from "../buildAppMarkup";

describe("buildAppMarkup", () => {
  it("provides a keyboard-accessible skip link to the main controls", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('href="#main-controls"');
    expect(markup).toContain("Skip to settings");
    expect(markup).toContain('id="main-controls"');
  });

  it("associates every settings input with a visible label", () => {
    const markup = buildAppMarkup();
    const document = new DOMParser().parseFromString(markup, "text/html");
    const labelledInputs = document.querySelectorAll("input[id], select[id]");

    for (const input of labelledInputs) {
      const id = input.getAttribute("id");
      expect(document.querySelector(`label[for="${id}"]`)).not.toBeNull();
    }
  });

  it("announces updated results to assistive technology", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="callout"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('id="metrics"');
    expect(markup).toContain('aria-live="polite"');
  });

  it("associates the chart with a keyboard-accessible selected moment control", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="chart-selected-moment"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("arrow keys");
    expect(markup).toContain("Page Up");
  });

  it("includes a searchable queue visualisation region", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="queue-visualisation-panel"');
    expect(markup).toContain('id="queue-search"');
    expect(markup).toContain("Search by name or finish position");
  });

  it("includes multi-lane proposed layout inputs", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="lane-count"');
    expect(markup).toContain('id="lane-length"');
    expect(markup).toContain("Lane count");
    expect(markup).toContain("Lane length (m)");
  });
});
