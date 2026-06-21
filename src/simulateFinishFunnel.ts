import { FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH } from "./defaults";
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

  const tokensPerMinute =
    settings.tokensPerMinutePerVolunteer * settings.volunteerCount;
  const secondsPerToken = 60 / tokensPerMinute;

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

  const handTokenToFrontFinisher = (timeSeconds: number) => {
    const finisher = queue.shift();
    if (!finisher) {
      return;
    }

    finisherSchedules.push({
      position: finisher.position,
      arrivalTimeSeconds: finisher.arrivalTimeSeconds,
      tokenHandoverTimeSeconds: timeSeconds,
      estimated: finisher.estimated,
    });
    recordQueueDepth(timeSeconds);
  };

  const processDeparturesThrough = (timeSeconds: number) => {
    while (nextDepartureTime <= timeSeconds && queue.length > 0) {
      handTokenToFrontFinisher(nextDepartureTime);
      if (queue.length > 0) {
        nextDepartureTime += secondsPerToken;
      } else {
        nextDepartureTime = Number.POSITIVE_INFINITY;
      }
    }
  };

  const waitForQueueSpace = (earliestAdmissionTimeSeconds: number) => {
    if (maxQueueDepth === undefined) {
      return earliestAdmissionTimeSeconds;
    }

    let admissionTimeSeconds = earliestAdmissionTimeSeconds;

    while (queue.length >= maxQueueDepth) {
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
    if (queue.length > 0) {
      nextDepartureTime += secondsPerToken;
    }
  }

  return {
    peakQueueDepth,
    queueDepthOverTime,
    funnelNotRequired: peakQueueDepth <= FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH,
    finisherSchedules,
    effectiveArrivals,
  };
}
