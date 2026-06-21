import type { FinisherArrival } from "./types";

export function spreadArrivalsWithinSecond(
  finishers: FinisherArrival[],
): FinisherArrival[] {
  const groups = new Map<number, FinisherArrival[]>();

  for (const finisher of finishers) {
    const second = Math.floor(finisher.timeSeconds);
    const group = groups.get(second) ?? [];
    group.push(finisher);
    groups.set(second, group);
  }

  const spread: FinisherArrival[] = [];

  for (const [second, group] of groups) {
    if (group.length === 1) {
      spread.push(group[0]);
      continue;
    }

    for (let index = 0; index < group.length; index += 1) {
      spread.push({
        ...group[index],
        timeSeconds: second + index / group.length,
      });
    }
  }

  return spread.sort((a, b) => a.timeSeconds - b.timeSeconds);
}
