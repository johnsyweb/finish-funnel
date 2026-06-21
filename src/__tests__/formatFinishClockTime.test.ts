import { describe, expect, it } from "vitest";
import { formatFinishClockTime } from "../formatFinishClockTime";

describe("formatFinishClockTime", () => {
  it("formats minute and second finish times", () => {
    expect(formatFinishClockTime(23 * 60 + 45)).toBe("23:45");
  });

  it("formats hour, minute and second finish times", () => {
    expect(formatFinishClockTime(1 * 3600 + 2 * 60 + 34)).toBe("1:02:34");
  });
});
