export type FixtureLayoutDefaults = {
  maximumLaneCount: number;
  maximumLaneLengthMetres: number;
};

const FIXTURE_LAYOUT_DEFAULTS: Record<string, FixtureLayoutDefaults> = {
  "bushy-1095": { maximumLaneCount: 3, maximumLaneLengthMetres: 300 },
  "mernda-400": { maximumLaneCount: 1, maximumLaneLengthMetres: 30 },
  "albert-melbourne-693": {
    maximumLaneCount: 2,
    maximumLaneLengthMetres: 200,
  },
};

export function fixtureLayoutDefaults(
  fixtureId: string,
): FixtureLayoutDefaults {
  return (
    FIXTURE_LAYOUT_DEFAULTS[fixtureId] ?? {
      maximumLaneCount: 1,
      maximumLaneLengthMetres: 30,
    }
  );
}
