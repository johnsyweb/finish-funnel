import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeFinishFunnel } from "../analyzeFinishFunnel";

function loadFixture(id: string) {
  const raw = readFileSync(
    new URL(`../../public/fixtures/${id}.json`, import.meta.url),
    "utf8",
  );
  return JSON.parse(raw) as {
    finishers: Array<{ position: number; time: string }>;
  };
}

describe("event fixtures", () => {
  it("sizes a record Bushy event for a single Finish Tokens volunteer", () => {
    const fixture = loadFixture("bushy-1095");
    const result = analyzeFinishFunnel({ finishers: fixture.finishers });

    expect(fixture.finishers.length).toBe(1564);
    expect(result.peakQueueDepth).toBeGreaterThan(100);
    expect(result.funnelNotRequired).toBe(false);
  });

  it("suggests a modest funnel for a quiet Mernda event", () => {
    const fixture = loadFixture("mernda-400");
    const result = analyzeFinishFunnel({ finishers: fixture.finishers });

    expect(fixture.finishers.length).toBe(80);
    expect(result.peakQueueDepth).toBeLessThanOrEqual(5);
    expect(result.recommendedLengthMetres).toBeLessThan(15);
  });
});
