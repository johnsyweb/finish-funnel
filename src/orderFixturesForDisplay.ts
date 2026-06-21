import { DEFAULT_FIXTURE_ID } from "./defaults";

export function orderFixturesForDisplay<T extends { id: string }>(
  fixtures: T[],
): T[] {
  return [...fixtures].sort((left, right) => {
    if (left.id === DEFAULT_FIXTURE_ID) {
      return -1;
    }
    if (right.id === DEFAULT_FIXTURE_ID) {
      return 1;
    }
    return left.id.localeCompare(right.id);
  });
}
