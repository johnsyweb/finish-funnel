# Queue table lane and batch columns

**Type:** AFK  
**Blocked by:** [08-multi-lane-ui-and-warnings](./08-multi-lane-ui-and-warnings.md)

## What to build

Extend queue visualisation table with **Lane** (1, 2, … or Overflow) and **Batch** (letter A, B, … only on batch marker holder rows) columns at the selected moment.

Wire `assignFinisherLanes` into `queuedFinishersAtMoment` or equivalent.

## Acceptance criteria

- [x] Lane column shows assignment for each queued finisher
- [x] Batch column sparse — letter only on first finisher per lane
- [x] Overflow rows show Overflow in lane column, blank batch
- [x] Table updates when lane layout or selected moment changes
- [x] `mise run check` passes

## Blocked by

- #08 Multi-lane UI, metrics, and warnings

## Deferred

- **Finish-line backup** — re-simulate blocked finisher arrivals when combined capacity exceeded (see `CONTEXT.md`)
