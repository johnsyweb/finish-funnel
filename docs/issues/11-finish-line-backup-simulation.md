# Finish-line backup simulation

**Type:** AFK  
**Blocked by:** [10-batch-markers-on-chart-timeline](./10-batch-markers-on-chart-timeline.md)

## What to build

When combined lane capacity is exceeded, finishers block at the finish line until a funnel slot opens. Adjust finisher arrivals and re-run token handover simulation so peak queue depth never exceeds combined lane capacity.

- Optional `maxQueueDepth` on `simulateFinishFunnel` (or dedicated wrapper) caps admissions
- Blocked finishers enter the queue when the front finisher receives a token and frees a slot
- Effective arrival times replace published times for downstream lane assignment and queue visualisation
- `analyzeFinishFunnel` uses capped simulation when multi-lane layout is configured
- Hide or replace the finish-line backup warning callout when backup is modelled

## Acceptance criteria

- [x] Peak queue depth capped at combined lane capacity for insufficient layouts
- [x] Blocked finishers receive delayed effective arrival times
- [x] Token handover order remains strict finish position order
- [x] Lane assignment uses effective arrivals (no overflow when backup applies)
- [x] Finish-line backup warning callout hidden when backup is modelled
- [x] `mise run check` passes

## Blocked by

- #10 Batch markers on chart timeline

## Deferred

- Finish-line backup delay metrics in UI (max/average wait at line)
