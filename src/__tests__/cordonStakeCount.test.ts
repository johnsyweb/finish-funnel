import { describe, expect, it } from "vitest";
import {
  cordonLineCount,
  cordonStakeCount,
  stakesPerCordonLine,
} from "../cordonStakeCount";

describe("stakesPerCordonLine", () => {
  it("counts both ends plus stakes every spacing interval along the line", () => {
    expect(stakesPerCordonLine(280, 5)).toBe(57);
    expect(stakesPerCordonLine(281, 5)).toBe(58);
    expect(stakesPerCordonLine(7, 5)).toBe(3);
    expect(stakesPerCordonLine(5, 5)).toBe(2);
  });

  it("returns one stake for a zero-length line", () => {
    expect(stakesPerCordonLine(0, 5)).toBe(1);
  });
});

describe("cordonLineCount", () => {
  it("returns lane count plus one shared boundary lines", () => {
    expect(cordonLineCount(1)).toBe(2);
    expect(cordonLineCount(3)).toBe(4);
  });
});

describe("cordonStakeCount", () => {
  it("sums stakes across all cordon lines for the layout", () => {
    expect(
      cordonStakeCount({
        laneCount: 3,
        laneLengthMetres: 280,
        cordonStakeSpacingMetres: 5,
      }),
    ).toBe(228);
  });

  it("counts both sides for a single-lane layout", () => {
    expect(
      cordonStakeCount({
        laneCount: 1,
        laneLengthMetres: 30,
        cordonStakeSpacingMetres: 5,
      }),
    ).toBe(14);
  });
});
