import { describe, expect, it } from "vitest";
import { assignUnknownFinishTimes } from "../assignUnknownFinishTimes";

describe("assignUnknownFinishTimes", () => {
  it("assigns the previous known finish time to an unknown finisher", () => {
    const result = assignUnknownFinishTimes([
      { position: 1, timeSeconds: 1200 },
      { position: 2, timeSeconds: null },
      { position: 3, timeSeconds: 1260 },
    ]);

    expect(result[1]).toMatchObject({
      timeSeconds: 1200,
      estimated: true,
    });
  });

  it("assigns the next known finish time when no previous time exists", () => {
    const result = assignUnknownFinishTimes([
      { position: 1, timeSeconds: null },
      { position: 2, timeSeconds: 1260 },
    ]);

    expect(result[0]).toMatchObject({
      timeSeconds: 1260,
      estimated: true,
    });
  });
});
