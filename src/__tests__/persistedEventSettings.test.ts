import { describe, expect, it } from "vitest";
import {
  DEFAULT_PERSISTED_EVENT_SETTINGS,
  loadPersistedEventSettings,
  savePersistedEventSettings,
} from "../persistedEventSettings";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

describe("persistedEventSettings", () => {
  it("returns defaults when nothing is stored", () => {
    const storage = createMemoryStorage();

    expect(
      loadPersistedEventSettings(storage, "finish-funnel:settings:/mernda/"),
    ).toEqual(DEFAULT_PERSISTED_EVENT_SETTINGS);
  });

  it("merges stored values over defaults", () => {
    const storage = createMemoryStorage();
    const key = "finish-funnel:settings:/mernda/";

    savePersistedEventSettings(storage, key, {
      ...DEFAULT_PERSISTED_EVENT_SETTINGS,
      maximumLaneCount: 4,
      maximumLaneLengthMetres: 120,
    });

    expect(loadPersistedEventSettings(storage, key)).toMatchObject({
      maximumLaneCount: 4,
      maximumLaneLengthMetres: 120,
      finisherSpacingMetres:
        DEFAULT_PERSISTED_EVENT_SETTINGS.finisherSpacingMetres,
    });
  });

  it("falls back to defaults when stored JSON is invalid", () => {
    const storage = createMemoryStorage();
    const key = "finish-funnel:settings:/mernda/";
    storage.setItem(key, "{not json");

    expect(loadPersistedEventSettings(storage, key)).toEqual(
      DEFAULT_PERSISTED_EVENT_SETTINGS,
    );
  });
});
