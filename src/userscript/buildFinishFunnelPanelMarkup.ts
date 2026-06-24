import type { PersistedEventSettings } from "../persistedEventSettings";
import { buildUserscriptSettingsMarkup } from "./buildUserscriptSettingsMarkup";

export function buildFinishFunnelPanelMarkup({
  persisted,
  layout,
  volunteerCount,
  fetchDelayOverridden,
}: {
  persisted: PersistedEventSettings;
  layout: { laneCount: number; laneLengthMetres: number };
  volunteerCount: number;
  fetchDelayOverridden: boolean;
}): string {
  return `<h2 class="finish-funnel-panel-heading">Finish Funnel</h2>
${buildUserscriptSettingsMarkup({
  persisted,
  layout,
  volunteerCount,
  fetchDelayOverridden,
})}
<div id="finish-funnel-callout" role="status" aria-live="polite" hidden></div>
<section class="metrics" id="finish-funnel-metrics" aria-live="polite" aria-atomic="true"></section>
<section class="finish-funnel-panel-section" id="finish-funnel-on-the-day" aria-live="polite">
  <h3>On the day</h3>
  <div id="finish-funnel-layout-setup-mount"></div>
</section>
<section class="finish-funnel-panel-section" id="finish-funnel-chart-section">
  <h3>Queue depth over finish time</h3>
  <p id="finish-funnel-chart-selected-moment" class="chart-selected-moment" aria-live="polite"></p>
  <div class="chart-wrap" id="finish-funnel-chart-wrap">
    <canvas
      id="finish-funnel-queue-chart"
      tabindex="0"
      role="img"
      aria-describedby="finish-funnel-chart-legend"
      aria-label="Queue depth over finish time. Click or drag to choose a moment; use arrow keys when focused; use Page Up and Page Down to jump between batch marker moments."
    ></canvas>
  </div>
  <div id="finish-funnel-chart-legend-mount" class="chart-legend-mount"></div>
</section>
<section class="finish-funnel-panel-section" id="finish-funnel-queue-moment-section" aria-live="polite">
  <h3 id="finish-funnel-queue-moment-heading">Queue at selected moment</h3>
  <div id="finish-funnel-queue-summary-mount"></div>
</section>`;
}
