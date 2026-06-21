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

export function simulateFinishFunnel(
  arrivals: FinisherArrival[],
  settings: FinishTokensSettings,
): SimulationResult {
  const sortedArrivals = [...arrivals].sort(
    (left, right) => left.timeSeconds - right.timeSeconds,
  );

  const tokensPerMinute =
    settings.tokensPerMinutePerVolunteer * settings.volunteerCount;
  const secondsPerToken = 60 / tokensPerMinute;

  const queue: QueuedFinisher[] = [];
  let peakQueueDepth = 0;
  let nextDepartureTime = Number.POSITIVE_INFINITY;
  const queueDepthOverTime: SimulationResult["queueDepthOverTime"] = [];
  const finisherSchedules: FinisherSchedule[] = [];

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

  for (const arrival of sortedArrivals) {
    const timeSeconds = arrival.timeSeconds;

    while (nextDepartureTime <= timeSeconds && queue.length > 0) {
      handTokenToFrontFinisher(nextDepartureTime);
      if (queue.length > 0) {
        nextDepartureTime += secondsPerToken;
      } else {
        nextDepartureTime = Number.POSITIVE_INFINITY;
      }
    }

    queue.push({
      position: arrival.position,
      arrivalTimeSeconds: timeSeconds,
      estimated: arrival.estimated,
    });
    peakQueueDepth = Math.max(peakQueueDepth, queue.length);
    recordQueueDepth(timeSeconds);

    if (queue.length > 0 && nextDepartureTime === Number.POSITIVE_INFINITY) {
      nextDepartureTime = timeSeconds + secondsPerToken;
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
  };
}
