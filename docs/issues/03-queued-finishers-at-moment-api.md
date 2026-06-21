# queuedFinishersAtMoment public API

**Type:** AFK  
**Blocked by:** [02-per-finisher-token-handover-schedule](./02-per-finisher-token-handover-schedule.md)

## What to build

Add a public entry point `queuedFinishersAtMoment` that, at a **selected moment** (clock finish time), returns **queued finishers** with:

- Finish position, name, published finish time
- Queue position (1 = next for token)
- Time waiting, time until token, total estimated queueing time (clock durations)
- Estimated flag for Unknown finish times

Support pagination (offset/limit) and optional filter by name or finish position. Expose **first moment at peak queue depth** for default selected moment.

Keep `analyzeFinishFunnel` focused on sizing; do not require loading full queue payloads for chart-only use.

## Acceptance criteria

- [x] At selected moment T, only finishers with arrival ≤ T and token handover > T are returned, front of queue first
- [x] Wait metrics match glossary definitions in `CONTEXT.md`
- [x] Pagination returns correct slice; total count available for UI
- [x] Search/filter by name substring or finish position works
- [x] `firstMomentAtPeakQueueDepth` (or equivalent) returns earliest peak instant
- [x] Tests through public interface only; `mise run check` passes

## Blocked by

- #02 Record token handover time per finisher
