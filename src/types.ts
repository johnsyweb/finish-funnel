export type FinisherArrival = {
  /** Seconds from event start (first finisher crossing). */
  timeSeconds: number;
  estimated?: boolean;
  position?: number;
};

export type FinishTokensSettings = {
  tokensPerMinutePerVolunteer: number;
  volunteerCount: number;
};

export type FinisherSchedule = {
  position?: number;
  arrivalTimeSeconds: number;
  tokenHandoverTimeSeconds: number;
  estimated?: boolean;
};

export type SimulationResult = {
  peakQueueDepth: number;
  queueDepthOverTime: Array<{ timeSeconds: number; queueDepth: number }>;
  funnelNotRequired: boolean;
  finisherSchedules: FinisherSchedule[];
};
