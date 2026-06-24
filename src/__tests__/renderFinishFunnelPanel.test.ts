// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildFinishFunnelPanelMarkup } from "../userscript/buildFinishFunnelPanelMarkup";
import { renderFinishFunnelPanel } from "../userscript/renderFinishFunnelPanel";
import { analyzeFinishFunnel } from "../analyzeFinishFunnel";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";
import { DEFAULT_FINISH_TOKENS_SETTINGS } from "../defaults";

describe("buildFinishFunnelPanelMarkup", () => {
  it("includes settings, mounts for metrics, chart, on the day, and queue summary", () => {
    const markup = buildFinishFunnelPanelMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      volunteerCount: 2,
      fetchDelayOverridden: false,
    });

    expect(markup).toContain('id="finish-funnel-settings"');
    expect(markup).toContain('id="finish-funnel-tokens-per-minute"');
    expect(markup).toContain('id="finish-funnel-chart-legend-mount"');
    expect(markup).toContain('aria-describedby="finish-funnel-chart-legend"');
    expect(markup).toContain('id="finish-funnel-metrics"');
    expect(markup).toContain('id="finish-funnel-queue-chart"');
    expect(markup).toContain('id="finish-funnel-layout-setup-mount"');
    expect(markup).toContain('id="finish-funnel-queue-summary-mount"');
  });
});

describe("renderFinishFunnelPanel", () => {
  it("renders metrics and queue summary for fixture finishers", () => {
    const finishers = [
      { position: 1, name: "Alex SMITH", time: "18:30" },
      { position: 2, name: "Sam JONES", time: "18:30" },
    ];

    const analysis = analyzeFinishFunnel({
      finishers,
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      decelerationZoneMetres:
        DEFAULT_PERSISTED_EVENT_SETTINGS.decelerationZoneMetres,
      finisherSpacingMetres:
        DEFAULT_PERSISTED_EVENT_SETTINGS.finisherSpacingMetres,
      maximumLaneCount: DEFAULT_PERSISTED_EVENT_SETTINGS.maximumLaneCount,
      maximumLaneLengthMetres:
        DEFAULT_PERSISTED_EVENT_SETTINGS.maximumLaneLengthMetres,
      laneCount: 1,
      laneLengthMetres: 30,
    });

    const panel = document.createElement("section");
    panel.innerHTML = buildFinishFunnelPanelMarkup({
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      volunteerCount: 1,
      fetchDelayOverridden: false,
    });

    renderFinishFunnelPanel(panel, {
      analysis,
      persisted: DEFAULT_PERSISTED_EVENT_SETTINGS,
      finishTokensSettings: DEFAULT_FINISH_TOKENS_SETTINGS,
      layout: { laneCount: 1, laneLengthMetres: 30 },
      finishers,
      momentSeconds: analysis.queueDepthOverTime[0]?.timeSeconds ?? 0,
    });

    expect(
      panel.querySelector("#finish-funnel-metrics")?.textContent,
    ).toContain("Peak queue capacity");
    expect(
      panel.querySelector("#finish-funnel-layout-setup-mount")?.textContent,
    ).toContain("Cordon stakes needed");
    expect(
      panel.querySelector("#finish-funnel-queue-summary-mount")?.innerHTML,
    ).toContain("queue-moment-summary");
    expect(
      panel
        .querySelector("#finish-funnel-chart-legend")
        ?.getAttribute("aria-label"),
    ).toBe("Chart legend");
  });
});
