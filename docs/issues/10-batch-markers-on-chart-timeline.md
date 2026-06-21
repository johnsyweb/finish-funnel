# Batch markers on chart timeline

**Type:** AFK  
**Blocked by:** [09-queue-table-lane-and-batch](./09-queue-table-lane-and-batch.md)

## What to build

Show every **batch marker moment** on the queue depth chart:

- Short vertical tick at finisher arrival time with letter only above the plot (distinct colour)
- Click a batch tick to move the selected moment
- Page Up / Page Down when chart focused jumps to previous / next batch marker moment
- Derived from `assignFinisherLanes` for the current proposed layout

## Acceptance criteria

- [x] All batch marker moments for the simulated event appear on the chart
- [x] Batch ticks visually distinct from selected-moment indicator
- [x] Click batch tick selects that moment
- [x] Page Up / Page Down jump between batch marker moments
- [x] Chart aria-label mentions batch navigation
- [x] `mise run check` passes

## Blocked by

- #09 Queue table lane and batch columns
