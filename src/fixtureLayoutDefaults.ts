export type FixtureLayoutDefaults = {
  laneCount: number;
  laneLengthMetres: number;
};

const FIXTURE_LAYOUT_DEFAULTS: Record<string, FixtureLayoutDefaults> = {
  "bushy-1095": { laneCount: 2, laneLengthMetres: 300 },
  "mernda-400": { laneCount: 1, laneLengthMetres: 30 },
};

export function fixtureLayoutDefaults(
  fixtureId: string,
): FixtureLayoutDefaults {
  return (
    FIXTURE_LAYOUT_DEFAULTS[fixtureId] ?? {
      laneCount: 1,
      laneLengthMetres: 30,
    }
  );
}
