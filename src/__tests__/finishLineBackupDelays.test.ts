import { describe, expect, it } from "vitest";
import { finishLineBackupDelaySummary } from "../finishLineBackupDelays";

describe("finishLineBackupDelaySummary", () => {
  it("returns undefined when no finishers were delayed at the finish line", () => {
    const arrivals = [
      { position: 1, timeSeconds: 0 },
      { position: 2, timeSeconds: 1 },
    ];

    expect(
      finishLineBackupDelaySummary({
        publishedArrivals: arrivals,
        effectiveArrivals: arrivals,
      }),
    ).toBeUndefined();
  });

  it("summarises max and average delay for blocked finishers", () => {
    expect(
      finishLineBackupDelaySummary({
        publishedArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 0.5 },
          { position: 3, timeSeconds: 1 },
        ],
        effectiveArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 0.5 },
          { position: 3, timeSeconds: 4 },
        ],
      }),
    ).toEqual({
      maxDelaySeconds: 3,
      averageDelaySeconds: 3,
      delayedFinisherCount: 1,
    });
  });

  it("counts every finisher delayed at the finish line", () => {
    expect(
      finishLineBackupDelaySummary({
        publishedArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 1 },
          { position: 3, timeSeconds: 2 },
        ],
        effectiveArrivals: [
          { position: 1, timeSeconds: 0 },
          { position: 2, timeSeconds: 4 },
          { position: 3, timeSeconds: 8 },
        ],
      }),
    ).toEqual({
      maxDelaySeconds: 6,
      averageDelaySeconds: 4.5,
      delayedFinisherCount: 2,
    });
  });
});
