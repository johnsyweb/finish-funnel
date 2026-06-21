import { FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH } from "./defaults";
import {
  advanceAfterTokenHandover,
  createInitialVolunteerPool,
  type TokenSupplyGapEvent,
} from "./finishTokensRotation";
import { tokenSupplyGapSummary } from "./tokenSupplyGapSummary";
import type {
  FinisherArrival,
  FinisherSchedule,
  FinishTokensSettings,
  SimulationResult,
} from "./types";

type QueuedFinisher = {
  position?: number;
  arrivalTimeSeconds: number;
  estimated?: boolean;
};

export type SimulateFinishFunnelOptions = {
  maxQueueDepth?: number;
};

export function simulateFinishFunnel(
  arrivals: FinisherArrival[],
  settings: FinishTokensSettings,
  options: SimulateFinishFunnelOptions = {},
): SimulationResult {
  const sortedArrivals = [...arrivals].sort(
    (left, right) => left.timeSeconds - right.timeSeconds,
  );

  const secondsPerToken = 60 / settings.tokensPerMinutePerVolunteer;
  const volunteerPool = createInitialVolunteerPool(
    settings.volunteerCount,
    settings.tokenSupplyBatchSize,
  );
  const tokenSupplyGapEvents: TokenSupplyGapEvent[] = [];

  const queue: QueuedFinisher[] = [];
  const effectiveArrivals: FinisherArrival[] = [];
  let peakQueueDepth = 0;
  let nextDepartureTime = Number.POSITIVE_INFINITY;
  const queueDepthOverTime: SimulationResult["queueDepthOverTime"] = [];
  const finisherSchedules: FinisherSchedule[] = [];
  const { maxQueueDepth } = options;

  const recordQueueDepth = (timeSeconds: number) => {
    queueDepthOverTime.push({ timeSeconds, queueDepth: queue.length });
  };

  const scheduleNextHandover = (timeSeconds: number) => {
    const { nextHandoverTimeSeconds, gap } = advanceAfterTokenHandover({
      pool: volunteerPool,
      timeSeconds,
      batchSize: settings.tokenSupplyBatchSize,
      fetchDelaySeconds: settings.tokenSupplyFetchDelaySeconds,
      secondsPerToken,
    });

    if (gap !== undefined) {
      tokenSupplyGapEvents.push(gap);
    }

    nextDepartureTime =
      queue.length > 0 ? nextHandoverTimeSeconds : Number.POSITIVE_INFINITY;
  };

  const handTokenToFrontFinisher = (timeSeconds: number) => {
    const finisher = queue.shift();
    if (!finisher) {
      return;
    }

    finisherSchedules.push({
      position: finisher.position,
      arrivalTimeSeconds: finisher.arrivalTimeSeconds,
      tokenHandoverTimeSeconds: timeSeconds,
      finishTokensVolunteerNumber: volunteerPool.activeIndex + 1,
      estimated: finisher.estimated,
    });
    recordQueueDepth(timeSeconds);
    scheduleNextHandover(timeSeconds);
  };

  const processDeparturesThrough = (timeSeconds: number) => {
    while (nextDepartureTime <= timeSeconds && queue.length > 0) {
      handTokenToFrontFinisher(nextDepartureTime);
    }
  };

  const waitForQueueSpace = (earliestAdmissionTimeSeconds: number) => {
    if (maxQueueDepth === undefined || maxQueueDepth <= 0) {
      return earliestAdmissionTimeSeconds;
    }

    let admissionTimeSeconds = earliestAdmissionTimeSeconds;

    while (queue.length >= maxQueueDepth) {
      if (nextDepartureTime === Number.POSITIVE_INFINITY) {
        return admissionTimeSeconds;
      }

      admissionTimeSeconds = Math.max(admissionTimeSeconds, nextDepartureTime);
      processDeparturesThrough(admissionTimeSeconds);
    }

    return admissionTimeSeconds;
  };

  for (const arrival of sortedArrivals) {
    const admissionTimeSeconds = waitForQueueSpace(arrival.timeSeconds);
    processDeparturesThrough(admissionTimeSeconds);

    queue.push({
      position: arrival.position,
      arrivalTimeSeconds: admissionTimeSeconds,
      estimated: arrival.estimated,
    });
    effectiveArrivals.push({
      position: arrival.position,
      timeSeconds: admissionTimeSeconds,
      estimated: arrival.estimated,
    });
    peakQueueDepth = Math.max(peakQueueDepth, queue.length);
    recordQueueDepth(admissionTimeSeconds);

    if (queue.length > 0 && nextDepartureTime === Number.POSITIVE_INFINITY) {
      nextDepartureTime = admissionTimeSeconds + secondsPerToken;
    }
  }

  while (queue.length > 0) {
    handTokenToFrontFinisher(nextDepartureTime);
  }

  return {
    peakQueueDepth,
    queueDepthOverTime,
    funnelNotRequired: peakQueueDepth <= FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH,
    finisherSchedules,
    effectiveArrivals,
    tokenSupplyGaps: tokenSupplyGapSummary(tokenSupplyGapEvents),
  };
}
