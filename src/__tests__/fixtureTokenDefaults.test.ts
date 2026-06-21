import { describe, expect, it } from "vitest";
import { fixtureTokenDefaults } from "../fixtureTokenDefaults";

describe("fixtureTokenDefaults", () => {
  it("defaults Mernda to 100-token supply batches", () => {
    expect(fixtureTokenDefaults("mernda-400")).toEqual({
      tokenSupplyBatchSize: 100,
    });
  });

  it("defaults Albert Melbourne and Bushy to 30-token supply batches", () => {
    expect(fixtureTokenDefaults("albert-melbourne-693")).toEqual({
      tokenSupplyBatchSize: 30,
    });
    expect(fixtureTokenDefaults("bushy-1095")).toEqual({
      tokenSupplyBatchSize: 30,
    });
  });
});
