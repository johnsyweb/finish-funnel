import { describe, expect, it } from "vitest";
import { parseFinishTimeToSeconds } from "../parseFinishTimeToSeconds";

describe("parseFinishTimeToSeconds", () => {
  it("parses minute and second finish times", () => {
    expect(parseFinishTimeToSeconds("23:45")).toBe(23 * 60 + 45);
  });

  it("parses hour, minute and second finish times", () => {
    expect(parseFinishTimeToSeconds("1:02:34")).toBe(1 * 3600 + 2 * 60 + 34);
  });

  it("returns null for unknown finish times", () => {
    expect(parseFinishTimeToSeconds("Unknown")).toBeNull();
    expect(parseFinishTimeToSeconds("")).toBeNull();
  });
});
