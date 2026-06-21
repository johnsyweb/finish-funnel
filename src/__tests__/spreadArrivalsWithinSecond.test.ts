import { describe, expect, it } from "vitest";
import { spreadArrivalsWithinSecond } from "../spreadArrivalsWithinSecond";

describe("spreadArrivalsWithinSecond", () => {
  it("spreads co-timed finishers evenly across their shared second", () => {
    const arrivals = spreadArrivalsWithinSecond([
      { timeSeconds: 100, estimated: false },
      { timeSeconds: 100, estimated: false },
      { timeSeconds: 100, estimated: false },
    ]);

    expect(arrivals.map((arrival) => arrival.timeSeconds)).toEqual([
      100,
      100 + 1 / 3,
      100 + 2 / 3,
    ]);
  });
});
