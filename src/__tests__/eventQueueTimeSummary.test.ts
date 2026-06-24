import { describe, expect, it } from "vitest";
import { eventQueueTimeSummary } from "../eventQueueTimeSummary";
import type { FinisherSchedule } from "../types";

function schedule(
  arrivalTimeSeconds: number,
  tokenHandoverTimeSeconds: number,
): FinisherSchedule {
  return { arrivalTimeSeconds, tokenHandoverTimeSeconds };
}

describe("eventQueueTimeSummary", () => {
  it("returns max, mean, and median queueing times at token handover", () => {
    const summary = eventQueueTimeSummary([
      schedule(0, 10),
      schedule(0, 30),
      schedule(0, 50),
    ]);

    expect(summary).toEqual({
      maxSeconds: 50,
      meanSeconds: 30,
      medianSeconds: 30,
      finisherCount: 3,
    });
  });

  it("includes zero-wait finishers in mean and median", () => {
    const summary = eventQueueTimeSummary([
      schedule(100, 100),
      schedule(100, 110),
      schedule(100, 130),
    ]);

    expect(summary.maxSeconds).toBe(30);
    expect(summary.meanSeconds).toBe(40 / 3);
    expect(summary.medianSeconds).toBe(10);
    expect(summary.finisherCount).toBe(3);
  });

  it("uses the standard median when finisher count is even", () => {
    const summary = eventQueueTimeSummary([
      schedule(0, 10),
      schedule(0, 20),
      schedule(0, 30),
      schedule(0, 40),
    ]);

    expect(summary.medianSeconds).toBe(25);
  });

  it("returns zeros when no finishers received tokens", () => {
    expect(eventQueueTimeSummary([])).toEqual({
      maxSeconds: 0,
      meanSeconds: 0,
      medianSeconds: 0,
      finisherCount: 0,
    });
  });
});
