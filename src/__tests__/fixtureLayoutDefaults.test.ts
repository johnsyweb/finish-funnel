import { describe, expect, it } from "vitest";
import { fixtureLayoutDefaults } from "../fixtureLayoutDefaults";

describe("fixtureLayoutDefaults", () => {
  it("defaults Bushy to 2 lanes of 300 m", () => {
    expect(fixtureLayoutDefaults("bushy-1095")).toEqual({
      laneCount: 2,
      laneLengthMetres: 300,
    });
  });

  it("defaults Mernda to 1 lane of 30 m", () => {
    expect(fixtureLayoutDefaults("mernda-400")).toEqual({
      laneCount: 1,
      laneLengthMetres: 30,
    });
  });
});
