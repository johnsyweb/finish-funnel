import { describe, expect, it } from "vitest";
import { finishTokensSettingsForEvent } from "../finishTokensSettingsForEvent";
import { DEFAULT_PERSISTED_EVENT_SETTINGS } from "../persistedEventSettings";

describe("finishTokensSettingsForEvent", () => {
  it("uses roster volunteer count and zero fetch delay when support is present", () => {
    const settings = finishTokensSettingsForEvent({
      persisted: {
        ...DEFAULT_PERSISTED_EVENT_SETTINGS,
        tokenSupplyFetchDelaySeconds: 30,
      },
      volunteers: [
        { name: "Harry LAND", role: "Finish Tokens," },
        { name: "John WILKINSON", role: "Finish Token Support," },
      ],
    });

    expect(settings).toMatchObject({
      volunteerCount: 1,
      tokenSupplyFetchDelaySeconds: 0,
      tokensPerMinutePerVolunteer:
        DEFAULT_PERSISTED_EVENT_SETTINGS.tokensPerMinutePerVolunteer,
      tokenSupplyBatchSize:
        DEFAULT_PERSISTED_EVENT_SETTINGS.tokenSupplyBatchSize,
    });
  });

  it("keeps persisted fetch delay when no support volunteer is rostered", () => {
    const settings = finishTokensSettingsForEvent({
      persisted: {
        ...DEFAULT_PERSISTED_EVENT_SETTINGS,
        tokenSupplyFetchDelaySeconds: 45,
      },
      volunteers: [{ name: "Harry LAND", role: "Finish Tokens," }],
    });

    expect(settings.tokenSupplyFetchDelaySeconds).toBe(45);
  });
});
