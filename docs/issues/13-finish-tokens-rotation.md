# Finish Tokens rotation and token supply batches

**Type:** AFK  
**Blocked by:** [12-queue-moment-summary](./12-queue-moment-summary.md)

## What to build

Model Finish Tokens volunteers in **rotation**: one active volunteer hands tokens at the configured rate; when a **token supply batch** is exhausted, the next volunteer in the pool takes over if their batch is ready, otherwise handover pauses for the **token supply fetch delay** (default 30 s).

Configurable: token supply batch size, fetch delay, rotation pool size. Fixture defaults: Mernda 100, Albert Melbourne 30, Bushy 30. Albert Melbourne parkrun fixture (#693, 2026-06-13) with layout 2 × 200 m.

## Acceptance criteria

- [x] Active volunteer handover rate not multiplied by volunteer count
- [x] Token supply gaps increase peak queue depth and wait metrics
- [x] Gap count and total pause in metrics when gaps occurred
- [x] UI inputs for batch size and fetch delay with fixture defaults
- [x] Albert Melbourne fixture bundled
- [x] `mise run check` passes

## Blocked by

- #12 Queue moment summary
