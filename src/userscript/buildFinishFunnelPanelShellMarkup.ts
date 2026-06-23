export function buildFinishFunnelPanelShellMarkup({
  peakQueueDepth,
  selectedMomentLabel,
}: {
  peakQueueDepth: number;
  selectedMomentLabel: string;
}): string {
  return `<h2 class="finish-funnel-panel-heading">Finish Funnel</h2>
<p class="finish-funnel-panel-summary">Peak queue capacity: <strong>${peakQueueDepth}</strong> finishers · Selected moment: ${selectedMomentLabel}</p>`;
}
