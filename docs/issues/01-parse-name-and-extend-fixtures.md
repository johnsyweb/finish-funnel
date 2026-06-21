# Parse finisher name and extend event results fixtures

**Type:** AFK  
**Blocked by:** None — can start immediately

## What to build

Extend event results parsing and bundled fixtures so each finisher has finish position, name (from the results row `data-name` attribute), and published finish time. Regenerate Bushy and Mernda fixtures from cached HTML.

Downstream simulation and queue visualisation depend on name being present in fixtures and in `EventFinisherInput`.

## Acceptance criteria

- [x] `parseResultsHtml` extracts `name` from `data-name` on each results row
- [x] Empty or missing `data-name` is handled without breaking the row (name omitted or empty string — pick one and test it)
- [x] `scripts/build-fixtures.ts` writes `name` into fixture JSON
- [x] `public/fixtures/bushy-1095.json` and `mernda-400.json` regenerated with names
- [x] Existing tests updated; new parser test covers a row like Carmen PALMER (`data-name="Carmen PALMER"`)
- [x] `mise run check` passes

## Blocked by

None — can start immediately.
