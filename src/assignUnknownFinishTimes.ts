export type OrderedFinisher = {
  position: number;
  timeSeconds: number | null;
};

export type FinisherWithTime = {
  position: number;
  timeSeconds: number;
  estimated: boolean;
};

function findPreviousKnownTime(
  finishers: OrderedFinisher[],
  startIndex: number,
): number | null {
  for (let index = startIndex - 1; index >= 0; index -= 1) {
    const timeSeconds = finishers[index].timeSeconds;
    if (timeSeconds !== null) {
      return timeSeconds;
    }
  }
  return null;
}

function findNextKnownTime(
  finishers: OrderedFinisher[],
  startIndex: number,
): number | null {
  for (let index = startIndex + 1; index < finishers.length; index += 1) {
    const timeSeconds = finishers[index].timeSeconds;
    if (timeSeconds !== null) {
      return timeSeconds;
    }
  }
  return null;
}

export function assignUnknownFinishTimes(
  finishers: OrderedFinisher[],
): FinisherWithTime[] {
  return finishers.map((finisher, index) => {
    if (finisher.timeSeconds !== null) {
      return {
        position: finisher.position,
        timeSeconds: finisher.timeSeconds,
        estimated: false,
      };
    }

    const previousTime = findPreviousKnownTime(finishers, index);
    const nextTime = findNextKnownTime(finishers, index);
    const estimatedTime = previousTime ?? nextTime ?? 0;

    return {
      position: finisher.position,
      timeSeconds: estimatedTime,
      estimated: estimatedTime > 0,
    };
  });
}
