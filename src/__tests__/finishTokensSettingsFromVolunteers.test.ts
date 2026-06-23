import { describe, expect, it } from "vitest";
import { finishTokensSettingsFromVolunteers } from "../finishTokensSettingsFromVolunteers";
import { parseVolunteersHtml } from "../parseVolunteersHtml";

describe("finishTokensSettingsFromVolunteers", () => {
  it("sets fetch delay to zero when Finish Token Support is rostered", () => {
    const volunteers = parseVolunteersHtml(`
      <tr class="Volunteers-table-row" data-name="A" data-role="Finish Tokens,"></tr>
      <tr class="Volunteers-table-row" data-name="B" data-role="Finish Token Support,"></tr>
    `);

    expect(finishTokensSettingsFromVolunteers(volunteers)).toMatchObject({
      volunteerCount: 1,
      tokenSupplyFetchDelaySeconds: 0,
    });
  });
});
