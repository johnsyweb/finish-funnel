# Assign finisher lanes

**Type:** AFK  
**Blocked by:** [06-multi-lane-capacity-and-adequacy](./06-multi-lane-capacity-and-adequacy.md)

## What to build

Public API `assignFinisherLanes` that replays finisher arrivals and token handovers in time order against a proposed multi-lane layout:

- Stay on the **current lane** while it has spare capacity; when full, switch to the lowest numbered lane with spare capacity
- When the chosen lane is empty before an arrival, start a new batch with the next batch marker letter **A**, **B**, **C**, …
- Lanes reopen as finishers receive tokens; lane switches are minimised to reduce Funnel Manager stress and error
- Finishers who arrive when every lane is full → **overflow** (no batch letter)
- Does not change token handover simulation

## Acceptance criteria

- [x] Each finisher gets lane number (1-based) or overflow
- [x] Batch marker only on first finisher per numbered lane (sparse)
- [x] Overflow after combined capacity exhausted in arrival order
- [x] `mise run check` passes

## Blocked by

- #06 Multi-lane capacity and adequacy
