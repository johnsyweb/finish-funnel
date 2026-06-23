import { describe, expect, it } from "vitest";
import {
  finishTokensVolunteerCount,
  hasFinishTokenSupport,
  normalizeVolunteerRole,
  parseVolunteersHtml,
} from "../parseVolunteersHtml";

const bushyVolunteerSnippet = `
<table>
  <tr class="Volunteers-table-row" data-name="Harry LAND" data-role="Finish Tokens,">
  </tr>
  <tr class="Volunteers-table-row" data-name="Isabella VON HOLSTEIN" data-role="Finish Tokens,">
  </tr>
  <tr class="Volunteers-table-row" data-name="John WILKINSON" data-role="Finish Token Support,">
  </tr>
</table>`;

describe("parseVolunteersHtml", () => {
  it("normalises trailing commas in volunteer roles", () => {
    expect(normalizeVolunteerRole("Finish Tokens,")).toBe("Finish Tokens");
  });

  it("counts Finish Tokens volunteers and Finish Token Support separately", () => {
    const volunteers = parseVolunteersHtml(bushyVolunteerSnippet);

    expect(volunteers).toHaveLength(3);
    expect(finishTokensVolunteerCount(volunteers)).toBe(2);
    expect(hasFinishTokenSupport(volunteers)).toBe(true);
  });
});
