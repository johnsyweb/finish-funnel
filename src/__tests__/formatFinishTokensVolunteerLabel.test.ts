import { describe, expect, it } from "vitest";
import { formatFinishTokensVolunteerLabel } from "../formatFinishTokensVolunteerLabel";

describe("formatFinishTokensVolunteerLabel", () => {
  it("labels volunteers in pool order", () => {
    expect(formatFinishTokensVolunteerLabel(1)).toBe("Finish Tokens 1");
    expect(formatFinishTokensVolunteerLabel(2)).toBe("Finish Tokens 2");
  });
});
