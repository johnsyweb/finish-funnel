export type CalloutState =
  | { hidden: true }
  | { hidden: false; className: string; text: string };

export function resolveCallout({
  funnelNotRequired,
  combinedLaneCapacity,
  peakQueueDepth,
  finishLineBackupModelled = false,
}: {
  funnelNotRequired: boolean;
  combinedLaneCapacity: number;
  peakQueueDepth: number;
  finishLineBackupModelled?: boolean;
}): CalloutState {
  if (funnelNotRequired) {
    return {
      hidden: false,
      className: "callout",
      text: "A roped-off funnel may not be needed for this event.",
    };
  }

  if (!finishLineBackupModelled && combinedLaneCapacity < peakQueueDepth) {
    return {
      hidden: false,
      className: "callout warn",
      text: "The queue would back over the finish line at peak. Finish-line backup is not yet modelled.",
    };
  }

  return { hidden: true };
}
