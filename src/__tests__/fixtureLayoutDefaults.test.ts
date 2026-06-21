import { describe, expect, it } from "vitest";
import { fixtureLayoutDefaults } from "../fixtureLayoutDefaults";

describe("fixtureLayoutDefaults", () => {
  it("defaults Bushy to 3 lanes of up to 300 m", () => {
    expect(fixtureLayoutDefaults("bushy-1095")).toEqual({
      maximumLaneCount: 3,
      maximumLaneLengthMetres: 300,
    });
  });

  it("defaults Mernda to 1 lane of up to 30 m", () => {
    expect(fixtureLayoutDefaults("mernda-400")).toEqual({
      maximumLaneCount: 1,
      maximumLaneLengthMetres: 30,
    });
  });

  it("defaults Albert Melbourne to 2 lanes of up to 200 m", () => {
    expect(fixtureLayoutDefaults("albert-melbourne-693")).toEqual({
      maximumLaneCount: 2,
      maximumLaneLengthMetres: 200,
    });
  });
});
