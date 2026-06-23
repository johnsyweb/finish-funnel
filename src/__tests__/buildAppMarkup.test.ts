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
    expect(markup).toContain('id="queue-chart-legend-mount"');
    expect(markup).toContain('aria-describedby="queue-chart-legend"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("arrow keys");
    expect(markup).toContain("Page Up");
  });

  it("includes an augmented results visualisation region", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="queue-visualisation-panel"');
    expect(markup).toContain('id="results-display-mode"');
    expect(markup).toContain("Detailed results display");
  });

  it("includes site constraints and layout inputs", () => {
    const markup = buildAppMarkup();

    expect(markup).toContain('id="maximum-lane-count"');
    expect(markup).toContain('id="maximum-lane-length"');
    expect(markup).toContain('id="layout-lane-count"');
    expect(markup).toContain('id="layout-lane-length"');
    expect(markup).toContain('id="cordon-stake-spacing"');
    expect(markup).toContain('id="reset-to-model-recommendation"');
    expect(markup).toContain("Site constraints");
    expect(markup).toContain("Layout assumptions");
    expect(markup).toContain("Layout");
    expect(markup).not.toContain("Proposed funnel");
  });

  it("includes the on-the-day layout setup panel between metrics and the chart", () => {
    const markup = buildAppMarkup();
    const metricsIndex = markup.indexOf('id="metrics"');
    const setupIndex = markup.indexOf('id="layout-setup-panel"');
    const chartIndex = markup.indexOf("Queue depth over finish time");

    expect(setupIndex).toBeGreaterThan(metricsIndex);
    expect(chartIndex).toBeGreaterThan(setupIndex);
    expect(markup).toContain("On the day");
    expect(markup).toContain('id="layout-setup-mount"');
  });
});
