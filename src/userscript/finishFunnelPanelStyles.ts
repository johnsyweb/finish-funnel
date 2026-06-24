export const FINISH_FUNNEL_PANEL_STYLE_ID = "finish-funnel-panel-styles";

export const finishFunnelPanelStyles = `
#finish-funnel-panel {
  --ff-bg: #ffffff;
  --ff-surface: #f6f4f8;
  --ff-text: #2b223d;
  --ff-muted: #5c5470;
  --ff-accent: #ffa300;
  --ff-ok: #2d8a6e;
  --ff-warn: #c0392b;
  --ff-border: rgba(43, 34, 61, 0.14);
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--ff-border);
  border-radius: 8px;
  background: var(--ff-bg);
  color: var(--ff-text);
  line-height: 1.5;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

#finish-funnel-panel h2,
#finish-funnel-panel h3 {
  color: var(--ff-accent);
  margin: 0 0 0.75rem;
}

#finish-funnel-panel .finish-funnel-panel-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ff-border);
}

#finish-funnel-panel .metrics {
  display: grid;
  gap: 0.75rem;
}

#finish-funnel-panel .metric {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: var(--ff-surface);
}

#finish-funnel-panel .metric span {
  display: block;
  font-size: 0.9rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .metric strong {
  display: block;
  font-size: 1.25rem;
  color: var(--ff-accent);
}

#finish-funnel-panel .metric.adequacy.ok strong {
  color: var(--ff-ok);
}

#finish-funnel-panel .metric.adequacy.bad strong {
  color: var(--ff-warn);
}

#finish-funnel-panel .metric.model-recommendation strong {
  font-size: 1rem;
  color: var(--ff-text);
}

#finish-funnel-panel .metric.metric-inline {
  font-size: 1rem;
  color: var(--ff-text);
}

#finish-funnel-panel .callout {
  border-left: 4px solid var(--ff-ok);
  padding: 0.75rem 1rem;
  background: rgba(45, 138, 110, 0.1);
  margin: 0 0 1rem;
}

#finish-funnel-panel .callout.warn {
  border-left-color: var(--ff-warn);
  background: rgba(192, 57, 43, 0.08);
}

#finish-funnel-panel .layout-setup-stakes {
  margin: 0 0 0.25rem;
}

#finish-funnel-panel .layout-setup-stakes strong {
  font-size: 1.25rem;
  color: var(--ff-accent);
}

#finish-funnel-panel .layout-setup-context {
  margin: 0 0 0.75rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .layout-setup-batch-cards {
  margin: 0;
}

#finish-funnel-panel .chart-wrap {
  position: relative;
  height: 280px;
}

#finish-funnel-panel #finish-funnel-queue-chart {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

#finish-funnel-panel .chart-selected-moment {
  margin: 0 0 0.75rem;
  color: var(--ff-muted);
  font-size: 0.95rem;
}

#finish-funnel-panel .chart-legend-mount {
  margin-top: 0.75rem;
}

#finish-funnel-panel .chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ff-muted);
  font-size: 0.9rem;
}

#finish-funnel-panel .chart-legend li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

#finish-funnel-panel .chart-legend-swatch {
  display: inline-block;
  flex-shrink: 0;
}

#finish-funnel-panel .chart-legend-swatch--queue-depth {
  width: 1.5rem;
  height: 0;
  border-top: 2px solid var(--ff-accent);
}

#finish-funnel-panel .chart-legend-swatch--peak-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed var(--ff-warn);
}

#finish-funnel-panel .chart-legend-swatch--layout-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed var(--ff-ok);
}

#finish-funnel-panel .chart-legend-swatch--model-recommendation-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed #7c5cbf;
}

#finish-funnel-panel .chart-legend-swatch--batch-marker-moment {
  width: 0;
  height: 1rem;
  border-left: 2px solid var(--ff-accent);
}

#finish-funnel-panel .queue-moment-summary {
  display: grid;
  gap: 0.5rem 1rem;
  margin: 0;
}

@media (min-width: 640px) {
  #finish-funnel-panel .queue-moment-summary {
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }
}

#finish-funnel-panel .queue-moment-summary dt {
  font-weight: 600;
  color: var(--ff-text);
}

#finish-funnel-panel .queue-moment-summary dd {
  margin: 0.15rem 0 0;
  color: var(--ff-muted);
}

#finish-funnel-panel .queue-finish-line-blocked {
  margin: 0.75rem 0 0;
  color: var(--ff-warn);
}

#finish-funnel-panel .finish-funnel-settings-row {
  display: grid;
  gap: 1rem;
}

#finish-funnel-panel .finish-funnel-settings-row + .finish-funnel-settings-row {
  margin-top: 1rem;
}

@media (min-width: 720px) {
  #finish-funnel-panel .finish-funnel-settings-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

#finish-funnel-panel .finish-funnel-fieldset {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ff-border);
  border-radius: 6px;
  background: var(--ff-surface);
  min-width: 0;
}

#finish-funnel-panel .finish-funnel-fieldset legend {
  padding: 0 0.35rem;
  color: var(--ff-accent);
  font-weight: 600;
}

#finish-funnel-panel .finish-funnel-field {
  margin: 0.5rem 0 0;
}

#finish-funnel-panel .finish-funnel-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .finish-funnel-field input[type="number"] {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--ff-border);
  border-radius: 4px;
  background: var(--ff-bg);
  color: var(--ff-text);
  font: inherit;
}

#finish-funnel-panel .finish-funnel-field input[type="number"]:focus-visible,
#finish-funnel-panel .finish-funnel-field button:focus-visible,
#finish-funnel-panel #finish-funnel-queue-chart:focus-visible {
  outline: 2px solid var(--ff-accent);
  outline-offset: 2px;
}

#finish-funnel-panel .finish-funnel-field input[readonly] {
  background: rgba(43, 34, 61, 0.06);
  color: var(--ff-muted);
}

#finish-funnel-panel .finish-funnel-field button {
  margin-top: 0.25rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--ff-border);
  border-radius: 4px;
  background: var(--ff-bg);
  color: var(--ff-text);
  font: inherit;
  cursor: pointer;
}

#finish-funnel-panel .finish-funnel-field button:hover {
  border-color: var(--ff-accent);
}
`;

export function ensureFinishFunnelPanelStyles(document: Document): void {
  if (document.getElementById(FINISH_FUNNEL_PANEL_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = FINISH_FUNNEL_PANEL_STYLE_ID;
  style.textContent = finishFunnelPanelStyles;
  document.head.append(style);
}
