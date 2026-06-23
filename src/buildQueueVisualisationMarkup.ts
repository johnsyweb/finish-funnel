import type { EventResultAtMoment } from "./eventResultsAtMoment";
import {
  augmentedResultsTableRowsFromEventResults,
  buildAugmentedResultsTableMarkup,
} from "./buildAugmentedResultsTableMarkup";

export function buildAugmentedResultsTableFromEventResults(
  finishers: EventResultAtMoment[],
  {
    displayMode = "compact",
  }: {
    displayMode?: "compact" | "detailed";
  } = {},
): string {
  return buildAugmentedResultsTableMarkup(
    augmentedResultsTableRowsFromEventResults(finishers),
    { displayMode },
  );
}
