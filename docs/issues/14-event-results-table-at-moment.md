# Event results table at selected moment

**Status:** done  
**Blocked by:** #13

## Goal

Replace the paginated queued-only queue table with a complete **event results table at selected moment**: one row per finisher in finish position order, with simulation columns populated according to row state.

## Acceptance

- Public API `eventResultsAtMoment` returns every results row with row state: **not yet finished**, **finish-line blocked**, **queued**, or **tokened**
- Simulation records `finishTokensVolunteerNumber` on each token handover; UI labels **Finish Tokens 1**, **Finish Tokens 2**, …
- Table columns: position, name, finish time, status, lane, batch, queue position, time waiting, time until token, total estimated queueing time, Finish Tokens volunteer
- Status: blank (not yet finished), **At finish line**, **In queue**, blank (tokened)
- Search by name or finish position filters visible rows; empty search shows all rows; no pagination; sticky header + scroll container
- `queuedFinishersAtMoment` re-exports from `eventResultsAtMoment` for compatibility

## Notes

- Glossary terms in `CONTEXT.md`: event results table at selected moment, finish-line blocked finisher, tokened finisher, Finish Tokens volunteer label, not-yet-finished finisher
