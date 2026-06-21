import { describe, expect, it } from "vitest";
import {
  advanceAfterTokenHandover,
  createInitialVolunteerPool,
} from "../finishTokensRotation";

describe("createInitialVolunteerPool", () => {
  it("starts every volunteer ready with a full batch and volunteer 1 active", () => {
    const pool = createInitialVolunteerPool(3, 30);

    expect(pool.activeIndex).toBe(0);
    expect(pool.volunteers).toEqual([
      { tokensRemaining: 30, batchReadyAt: 0 },
      { tokensRemaining: 30, batchReadyAt: 0 },
      { tokensRemaining: 30, batchReadyAt: 0 },
    ]);
  });
});

describe("advanceAfterTokenHandover", () => {
  it("schedules the next handover within the same batch", () => {
    const pool = createInitialVolunteerPool(1, 30);

    const result = advanceAfterTokenHandover({
      pool,
      timeSeconds: 4,
      batchSize: 30,
      fetchDelaySeconds: 30,
      secondsPerToken: 4,
    });

    expect(result.gap).toBeUndefined();
    expect(result.nextHandoverTimeSeconds).toBe(8);
    expect(pool.volunteers[0]?.tokensRemaining).toBe(29);
  });

  it("pauses handover when a single volunteer must fetch the next batch", () => {
    const pool = createInitialVolunteerPool(1, 2);

    advanceAfterTokenHandover({
      pool,
      timeSeconds: 4,
      batchSize: 2,
      fetchDelaySeconds: 30,
      secondsPerToken: 4,
    });
    const result = advanceAfterTokenHandover({
      pool,
      timeSeconds: 8,
      batchSize: 2,
      fetchDelaySeconds: 30,
      secondsPerToken: 4,
    });

    expect(result.gap).toEqual({ startSeconds: 8, endSeconds: 38 });
    expect(result.nextHandoverTimeSeconds).toBe(42);
  });

  it("rotates immediately when the next volunteer already has a batch ready", () => {
    const pool = createInitialVolunteerPool(2, 2);

    advanceAfterTokenHandover({
      pool,
      timeSeconds: 4,
      batchSize: 2,
      fetchDelaySeconds: 30,
      secondsPerToken: 4,
    });
    const result = advanceAfterTokenHandover({
      pool,
      timeSeconds: 8,
      batchSize: 2,
      fetchDelaySeconds: 30,
      secondsPerToken: 4,
    });

    expect(result.gap).toBeUndefined();
    expect(pool.activeIndex).toBe(1);
    expect(result.nextHandoverTimeSeconds).toBe(12);
    expect(pool.volunteers[0]?.batchReadyAt).toBe(38);
  });
});
