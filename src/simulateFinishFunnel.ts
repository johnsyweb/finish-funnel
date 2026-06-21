import { FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH } from "./defaults";
import type {
  FinisherArrival,
  FinishTokensSettings,
  SimulationResult,
} from "./types";

export function simulateFinishFunnel(
  arrivals: FinisherArrival[],
  settings: FinishTokensSettings,
): SimulationResult {
  const sortedArrivals = [...arrivals].sort(
    (a, b) => a.timeSeconds - b.timeSeconds,
  );

  const tokensPerMinute =
    settings.tokensPerMinutePerVolunteer * settings.volunteerCount;
  const secondsPerToken = 60 / tokensPerMinute;

  let queueDepth = 0;
  let peakQueueDepth = 0;
  let nextDepartureTime = Number.POSITIVE_INFINITY;
  const queueDepthOverTime: SimulationResult["queueDepthOverTime"] = [];

  const recordQueueDepth = (timeSeconds: number) => {
    queueDepthOverTime.push({ timeSeconds, queueDepth });
  };

  for (const arrival of sortedArrivals) {
    const timeSeconds = arrival.timeSeconds;

    while (nextDepartureTime <= timeSeconds && queueDepth > 0) {
      queueDepth -= 1;
      recordQueueDepth(nextDepartureTime);
      if (queueDepth > 0) {
        nextDepartureTime += secondsPerToken;
      } else {
        nextDepartureTime = Number.POSITIVE_INFINITY;
      }
    }

    queueDepth += 1;
    peakQueueDepth = Math.max(peakQueueDepth, queueDepth);
    recordQueueDepth(timeSeconds);

    if (queueDepth > 0 && nextDepartureTime === Number.POSITIVE_INFINITY) {
      nextDepartureTime = timeSeconds + secondsPerToken;
    }
  }

  while (queueDepth > 0) {
    queueDepth -= 1;
    recordQueueDepth(nextDepartureTime);
    if (queueDepth > 0) {
      nextDepartureTime += secondsPerToken;
    }
  }

  return {
    peakQueueDepth,
    queueDepthOverTime,
    funnelNotRequired: peakQueueDepth <= FUNNEL_NOT_REQUIRED_PEAK_QUEUE_DEPTH,
  };
}
