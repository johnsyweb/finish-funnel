import type { ProposedMultiLaneLayoutCheck } from "./multiLaneFunnel";

export function buildMetricsMarkup({
  peakQueueDepth,
  proposedMultiLaneLayout,
}: {
  peakQueueDepth: number;
  proposedMultiLaneLayout: ProposedMultiLaneLayoutCheck;
}): string {
  const adequacyText = proposedMultiLaneLayout.sufficient
    ? `Sufficient (${proposedMultiLaneLayout.headroomFinishers} finisher headroom)`
    : `Short by ${proposedMultiLaneLayout.shortfallFinishers} finishers`;

  return `
    <div class="metric">
      <span>Peak queue capacity</span>
      <strong>${peakQueueDepth}</strong>
      finishers
    </div>
    <div class="metric">
      <span>Minimum lanes required</span>
      <strong>${proposedMultiLaneLayout.minimumLanesRequired}</strong>
      at configured lane length
    </div>
    <div class="metric">
      <span>Combined lane capacity</span>
      <strong>${proposedMultiLaneLayout.combinedLaneCapacity}</strong>
      finishers in proposed layout
    </div>
    <div class="metric adequacy ${proposedMultiLaneLayout.sufficient ? "ok" : "bad"}">
      <span>Proposed layout</span>
      <strong>${adequacyText}</strong>
    </div>
  `;
}
