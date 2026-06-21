# Record token handover time per finisher

**Type:** AFK  
**Blocked by:** [01-parse-name-and-extend-fixtures](./01-parse-name-and-extend-fixtures.md)

## What to build

Extend the finish funnel simulation so each finisher has a recorded **token handover time** (simulated clock finish time when they receive a finish token), while keeping aggregate queue depth behaviour unchanged for the chart.

The schedule links finisher identity (position at minimum) to arrival and handover times for later queue queries.

## Acceptance criteria

- [x] Simulation produces per-finisher token handover times consistent with discrete token handover rate
- [x] Co-timed arrivals and Unknown neighbour estimates still behave as today
- [x] `simulateFinishFunnel` / chart peak depth unchanged for existing tests
- [x] New tests verify handover ordering (front of queue leaves first) and timing (interval = 60 ÷ tokens per minute)
- [x] `mise run check` passes

## Blocked by

- #01 Parse finisher name and extend event results fixtures
