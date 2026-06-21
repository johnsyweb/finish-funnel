# Handoff: Finish Funnel app

**Date:** 2026-06-21  
**Status:** v1 sizing app, queue visualisation, multi-lane layout, and finish-line backup complete; not deployed; no userscript yet

---

## Goal

Build a standalone web app that tells parkrun event teams how to size a **finish funnel** so **Finish Tokens** volunteers can hand out numbered tokens in strict finish position order during busy finish periods. v1 was single-lane; multi-lane layouts are complete.

Test fixtures:

- [Bushy #1095](https://www.parkrun.org.uk/bushy/results/1095/) — record stress case (1,564 finishers)
- [Mernda #400](https://www.parkrun.com.au/mernda/results/400/) — quiet case

---

## Design decisions (resolved via grill-with-docs)

Full glossary: [`CONTEXT.md`](./CONTEXT.md)

### Sizing (v1 — done)

| Topic                   | Decision                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Primary output          | Queue capacity (people) + derived physical length (metres)                                  |
| Token handover          | Per-volunteer rate × headcount; role name **Finish Tokens**                                 |
| Arrivals                | Per-second; co-timed finishers spread evenly within the second                              |
| Unknown times           | Neighbour estimate (prev known, else next); port of tampermonkey `assignUnknownFinishTimes` |
| Interaction             | Recommendation + proposed-funnel adequacy check                                             |
| Data (v1)               | Bundled fixtures; userscript for live results later                                         |
| Spacing                 | Configurable finisher spacing (default 0.75 m)                                              |
| Deceleration            | Fixed zone at finish-line end (default 5 m); not counted in queue capacity                  |
| Chart                   | Queue depth vs **clock finish time**; peak + proposed capacity reference lines              |
| Defaults                | 15 tokens/min, 1 volunteer; default fixture **Mernda #400**                                 |
| Recommendation rounding | Exact peak capacity; physical length rounded **up to whole metres**                         |
| “Funnel not required”   | Callout when peak queue depth ≤ **2** (fixed threshold)                                     |
| Proposed funnel input   | Metres only                                                                                 |
| App shape               | Standalone Vite + TypeScript (like foretoken/pr-by-pt)                                      |
| Parser sharing          | Implement in finish-funnel first; port to tampermonkey-parkrun when userscript ships        |
| Out of scope v1         | Speed-aware deceleration, live URL fetch                                                    |

### Queue visualisation (done — 2026-06-21)

| Topic                | Decision                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Selected moment      | Clock finish time on chart; **queued finisher** = arrived, not yet tokened                                   |
| Default moment       | **First** instant peak queue depth is reached; reset on simulation settings change                           |
| Event results fields | Finish **position**, **name** (`data-name`), published **finish time** only                                  |
| Queue visualisation  | Paginated table (25/page, front first); optional search by name or position; spatial funnel diagram deferred |
| Table columns        | Finish position, name, time, queue position, time waiting, time until token, total estimated queueing time   |
| Unknown finishers    | Estimated badge; wait metrics from neighbour-estimated arrival                                               |
| Chart interaction    | Click/drag vertical indicator; arrow keys when chart focused; readable clock time on chart                   |
| API                  | `queuedFinishersAtMoment`; shared sim core records **token handover time** per finisher                      |

### Multi-lane layout (done — 2026-06-21)

| Topic                 | Decision                                                                                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token handover        | Strict finish position order always; lanes do not create token batches                                                                                                                                                                                                                                             |
| Lane geometry         | Each lane: total metres incl. deceleration; lane queue capacity = `(length − deceleration) ÷ spacing`                                                                                                                                                                                                              |
| Adequacy              | Combined lane capacity (sum) vs peak queue depth; minimum lanes required at configured lane length                                                                                                                                                                                                                 |
| Lane assignment       | Stay on current lane until full; then lowest numbered lane with capacity; batch letters **A**, **B**, **C**, … only on **lane-fill switch** to a different lane (not at event start); none when `laneCount === 1`; steady-state one-in-one-out on the same lane does not advance the batch; minimise lane switches |
| Overflow              | Without backup: after all lanes full; with finish-line backup modelled, admissions delay until a slot opens                                                                                                                                                                                                        |
| UI inputs             | **Lane count** + **lane length (m)**; Bushy default 2 × 300 m; Mernda 1 × 30 m                                                                                                                                                                                                                                     |
| Metrics               | Minimum lanes required replaces single-lane recommended metres                                                                                                                                                                                                                                                     |
| Chart                 | Proposed capacity reference line → combined lane capacity                                                                                                                                                                                                                                                          |
| Warnings              | Funnel-not-required callout when peak ≤ 2; finish-line backup warning only when layout configured without backup modelling                                                                                                                                                                                         |
| Selected moment       | Lane layout changes do **not** reset selected moment                                                                                                                                                                                                                                                               |
| Queue table           | **Lane**, **Batch** (physical batch on every row; card badge on batch marker holder)                                                                                                                                                                                                                               |
| Queue moment summary  | Per-lane utilisation (finishers + metres) and physical batch counts at selected moment                                                                                                                                                                                                                             |
| Batch marker timeline | Every batch marker moment on chart; orange tick + letter; click to select; Page Up/Down to jump                                                                                                                                                                                                                    |
| Deferred              | —                                                                                                                                                                                                                                                                                                                  |

Implementation issues: [`docs/issues/`](./docs/issues/) (#06–12)

---

## Implementation state

### Done

- **Domain modules** (115 tests):
  - `simulateFinishFunnel`, `simulateFinishTokens`, `assignUnknownFinishTimes`, `spreadArrivalsWithinSecond`
  - `parseFinishTimeToSeconds`, `parseResultsHtml`
  - `recommendPhysicalFunnelLength`, `checkProposedFunnel`, `analyzeFinishFunnel`
  - `formatFinishClockTime`, `drawQueueDepthChart`
  - `orderFixturesForDisplay`, `attachCanvasResizeHandler`, `buildAppMarkup`
- **Fixtures:** `public/fixtures/bushy-1095.json`, `public/fixtures/mernda-400.json`
- **UI:** fixture selector (Mernda default), settings, metrics, adequacy, canvas chart with resize
- **Tooling:** mise, aube, hk; eslint, prettier; `mise run check`
- **Git:** atomic conventional commits on `main`
- **Docs:** `README.md`, `CONTEXT.md`

### Fixture analysis (default settings: 1 Finish Tokens volunteer @ 15/min)

| Event       | Finishers | Peak queue | Min lanes @ 300 m |
| ----------- | --------- | ---------- | ----------------- |
| Bushy #1095 | 1,564     | 1,042      | 3                 |
| Mernda #400 | 80        | 3          | 1                 |

_Bushy 2 × 300 m → combined capacity 786; uncapped peak 1,042; with finish-line backup modelled peak caps at 786._

### Multi-lane layout (done — 2026-06-21)

- `multiLaneFunnel`, `assignFinisherLanes`, lane/batch queue table
- UI inputs, metrics, finish-line backup warning, combined capacity chart line
- **Batch marker moments** on queue depth chart timeline (lane-fill switch only)

### Finish-line backup (done — 2026-06-21)

- `simulateFinishFunnel` optional `maxQueueDepth`; `simulateFinishTokens` wrapper
- Capped simulation wired through `analyzeFinishFunnel` and `queuedFinishersAtMoment`
- Finish-line backup warning hidden when backup is modelled
- Finisher spacing clamped to lane queue zone in UI and simulation
- Finish-line backup delay metrics (max, average, count) when backup occurs

### Queue moment summary (done — 2026-06-21)

- `physicalBatch` and `isBatchMarkerHolder` on every multi-lane finisher
- `queueMomentSummaryFromAssignments`, `buildQueueMomentSummaryMarkup`
- Per-lane utilisation and batch counts; finish-line blocked line when backup modelled
- Event-wide batch marker card count in queue moment summary
- Section heading `Queue at selected moment (N)`; physical batch on every queue table row

### Not done

- No deployment to johnsy.com
- No tampermonkey-parkrun userscript integration

---

## Key files

```
finish-funnel/
├── CONTEXT.md              # Domain glossary
├── HANDOFF.md              # This file
├── docs/issues/            # Implementation issues (no GitHub remote yet)
├── mise.toml               # mise + aube + hk
├── hk.pkl                  # pre-commit → script/check
├── README.md
├── index.html
├── package.json
├── public/fixtures/
├── scripts/build-fixtures.ts
└── src/
    ├── analyzeFinishFunnel.ts
    ├── simulateFinishFunnel.ts
    ├── main.ts
    └── __tests/
```

---

## Commands

```bash
mise run setup
aube run dev
aube test
mise run check
aube run build:fixtures   # needs /tmp/*.html from curl (see README)
```

---

## Suggested next steps (priority order)

1. **Userscript** — port parser + APIs to tampermonkey-parkrun
2. **Deploy** — johnsy.com hosting alongside other parkrun utilities

---

## Suggested skills

| Skill             | When to use                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `/tdd`            | Queue visualisation vertical slices                              |
| `grill-with-docs` | Revisit design if spatial funnel or richer results fields needed |
| `to-issues`       | Further breakdown if slices need splitting                       |
| `review`          | Review branch before PR once remote exists                       |

---

## Notes for fresh agent

- User prefers **Australian English** in UI copy and docs.
- Toolchain: **mise**, **aube**, **hk** ([en.dev](https://en.dev/)).
- Commit frequently when working AFK; use atomic conventional commits.
- parkrun results pages return **403 without a browser User-Agent** when curling fixtures.
- Empty `<div class="compact">` in time cells means **Unknown** — parser handles this.
- Do not duplicate `CONTEXT.md` content into new docs; update glossary there as terms evolve.
