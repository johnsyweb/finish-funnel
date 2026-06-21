# Chart selected moment interaction

**Type:** AFK  
**Blocked by:** [03-queued-finishers-at-moment-api](./03-queued-finishers-at-moment-api.md)

## What to build

Let event teams pick a **selected moment** on the queue depth chart: vertical indicator, readable clock time label, click and drag on the chart, Left/Right arrow keys when the chart has focus. Default to **first moment at peak queue depth**; reset to that moment when simulation settings change.

Chart remains keyboard-accessible.

## Acceptance criteria

- [x] Vertical indicator at selected moment on chart
- [x] Clock finish time shown at indicator (reuse `formatFinishClockTime`)
- [x] Click and drag update selected moment
- [x] Arrow keys nudge selected moment when chart focused
- [x] On load and on settings change, selected moment = first instant of peak queue depth
- [x] Tests where feasible through public chart helpers or behaviour specs; `mise run check` passes

## Blocked by

- #03 queuedFinishersAtMoment public API
