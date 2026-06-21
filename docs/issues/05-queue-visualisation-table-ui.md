# Queue visualisation table UI

**Type:** AFK  
**Blocked by:** [04-chart-selected-moment-interaction](./04-chart-selected-moment-interaction.md)

## What to build

Below the chart, show **queue visualisation** at the selected moment: summary line (queue depth) plus paginated table (25 rows per page, front of queue first) with columns:

1. Finish position
2. Name
3. Published finish time
4. Queue position
5. Time waiting
6. Time until token
7. Total estimated queueing time

Unknown finishers show an estimated indicator. Optional search by name or finish position. All controls keyboard-accessible; Australian English copy.

## Acceptance criteria

- [x] Table updates when selected moment or settings change
- [x] Pagination controls work from keyboard; default page shows queue positions 1–25
- [x] Search/filter finds finishers in large queues (Bushy stress case)
- [x] Estimated badge on Unknown finish times
- [x] Accessible table semantics (`<table>`, headers, caption or aria-label)
- [x] `mise run check` passes

## Blocked by

- #04 Chart selected moment interaction
