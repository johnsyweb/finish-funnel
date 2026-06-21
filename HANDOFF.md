# Handoff: Finish Funnel app

**Date:** 2026-06-21  
**Status:** v1 sizing app and queue visualisation complete; not deployed; no userscript yet

---

## Goal

Build a standalone web app that tells parkrun event teams how long a **single-lane finish funnel** should be so **Finish Tokens** volunteers can hand out numbered tokens in order during busy finish periods.

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
| Out of scope v1         | Multi-lane, speed-aware deceleration, live URL fetch                                        |

### Queue visualisation (next — designed 2026-06-21)

| Topic                | Decision                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Selected moment      | Clock finish time on chart; **queued finisher** = arrived, not yet tokened                                   |
| Default moment       | **First** instant peak queue depth is reached; reset on simulation settings change                           |
| Event results fields | Finish **position**, **name** (`data-name`), published **finish time** only                                  |
| Queue visualisation  | Paginated table (25/page, front first); optional search by name or position; spatial funnel diagram deferred |
| Table columns        | Finish position, name, time, queue position, time waiting, time until token, total estimated queueing time   |
| Unknown finishers    | Estimated badge; wait metrics from neighbour-estimated arrival                                               |
| Chart interaction    | Click/drag vertical indicator; arrow keys when chart focused; readable clock time on chart                   |
| API                  | New `queuedFinishersAtMoment`; shared sim core records **token handover time** per finisher                  |
| Priority             | Before userscript and deploy                                                                                 |

Implementation issues: [`docs/issues/`](./docs/issues/)

---

## Implementation state

### Done

- **Domain modules** (29 tests):
  - `simulateFinishFunnel`, `assignUnknownFinishTimes`, `spreadArrivalsWithinSecond`
  - `parseFinishTimeToSeconds`, `parseResultsHtml`
  - `recommendPhysicalFunnelLength`, `checkProposedFunnel`, `analyzeFinishFunnel`
  - `formatFinishClockTime`, `drawQueueDepthChart`
  - `orderFixturesForDisplay`, `attachCanvasResizeHandler`, `buildAppMarkup`
- **Fixtures:** `public/fixtures/bushy-1095.json`, `public/fixtures/mernda-400.json`
- **UI:** fixture selector (Mernda default), settings, metrics, adequacy, canvas chart with resize
- **Tooling:** mise, aube, hk; eslint, prettier; `mise run check`
- **Git:** six atomic conventional commits on `main`
- **Docs:** `README.md`, `CONTEXT.md`

### Fixture analysis (default settings: 1 Finish Tokens volunteer @ 15/min)

| Event       | Finishers | Peak queue | Recommended length |
| ----------- | --------- | ---------- | ------------------ |
| Bushy #1095 | 1,564     | 1,042      | 787 m              |
| Mernda #400 | 80        | 3          | 8 m                |

### Queue visualisation (done)

- Parser/fixtures include finisher **name**
- `simulateFinishFunnel` records **token handover time** per finisher
- `queuedFinishersAtMoment` + `firstMomentAtPeakQueueDepth`
- Chart **selected moment** (click, drag, arrow keys; defaults to first peak)
- **Queue table** below chart: summary, search, paginated rows (25/page), estimated badge

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

1. **Userscript** — port parser + `queuedFinishersAtMoment` to tampermonkey-parkrun
2. **Deploy** — johnsy.com hosting alongside other parkrun utilities
3. **Commit** — atomic conventional commits when requested

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
- Do not commit unless explicitly asked.
- parkrun results pages return **403 without a browser User-Agent** when curling fixtures.
- Empty `<div class="compact">` in time cells means **Unknown** — parser handles this.
- Do not duplicate `CONTEXT.md` content into new docs; update glossary there as terms evolve.
