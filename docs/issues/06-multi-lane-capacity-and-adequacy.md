# Multi-lane capacity and adequacy

**Type:** AFK  
**Blocked by:** [05-queue-visualisation-table-ui](./05-queue-visualisation-table-ui.md)

## What to build

Domain functions for multi-lane proposed funnel layout:

- `laneQueueCapacity` — finishers one lane holds at a given physical length
- `combinedLaneCapacity` — sum across lane count
- `minimumLanesRequired` — smallest lane count at configured length for peak queue depth
- `checkProposedMultiLaneLayout` — sufficiency, headroom, shortfall vs peak queue depth

Single-lane behaviour must match existing `checkProposedFunnel` when `laneCount === 1`.

## Acceptance criteria

- [x] 300 m lane at default spacing/deceleration yields 393 finishers per lane
- [x] Bushy 2 × 300 m → combined capacity 786; shortfall 256 at peak 1,042
- [x] Minimum lanes at 300 m for peak 1,042 is 3
- [x] `mise run check` passes

## Blocked by

- #05 Queue visualisation table UI
