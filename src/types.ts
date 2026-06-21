export type FinisherArrival = {
  /** Seconds from event start (first finisher crossing). */
  timeSeconds: number;
  estimated?: boolean;
};

export type FinishTokensSettings = {
  tokensPerMinutePerVolunteer: number;
  volunteerCount: number;
};

export type SimulationResult = {
  peakQueueDepth: number;
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>;
  funnelNotRequired: boolean;
};
