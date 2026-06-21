# Handoff: Finish Funnel app

**Date:** 2026-06-21  
**Status:** v1 domain model and UI scaffolded; not committed; no userscript yet

---

## Goal

Build a standalone web app that tells parkrun event teams how long a **single-lane finish funnel** should be so **Finish Tokens** volunteers can hand out numbered tokens in order during busy finish periods.

Test fixtures:

- [Bushy #1095](https://www.parkrun.org.uk/bushy/results/1095/) — record stress case (1,564 finishers)
- [Mernda #400](https://www.parkrun.com.au/mernda/results/400/) — quiet case

---

## Design decisions (resolved via grill-with-docs)

Full glossary: [`CONTEXT.md`](./CONTEXT.md)

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
| Defaults                | 15 tokens/min, 1 volunteer                                                                  |
| Recommendation rounding | Exact peak capacity; physical length rounded **up to whole metres**                         |
| “Funnel not required”   | Callout when peak queue depth ≤ **2** (fixed threshold)                                     |
| Proposed funnel input   | Metres only                                                                                 |
| App shape               | Standalone Vite + TypeScript (like foretoken/pr-by-pt)                                      |
| Parser sharing          | Implement in finish-funnel first; port to tampermonkey-parkrun when userscript ships        |
| Out of scope v1         | Multi-lane, speed-aware deceleration, live URL fetch                                        |

---

## Implementation state

### Done

- **Domain modules** (all tested, 21 tests passing):
  - `simulateFinishFunnel` — discrete chronological token handover
  - `assignUnknownFinishTimes`, `spreadArrivalsWithinSecond`
  - `parseFinishTimeToSeconds`, `parseResultsHtml`
  - `recommendPhysicalFunnelLength`, `checkProposedFunnel`
  - `analyzeFinishFunnel` — public entry point
  - `formatFinishClockTime`, `drawQueueDepthChart`
- **Fixtures:** `public/fixtures/bushy-1095.json`, `public/fixtures/mernda-400.json` (regenerate via `npm run build:fixtures` using HTML cached in `/tmp/bushy1095.html` and `/tmp/mernda400.html`)
- **UI:** `index.html`, `src/main.ts` — fixture selector, settings, metrics, adequacy, canvas chart
- **Build:** `npm test`, `npm run typecheck`, `npm run build` all succeed
- **Docs:** `README.md`, `CONTEXT.md`

### Fixture analysis (default settings: 1 Finish Tokens volunteer @ 15/min)

| Event       | Finishers | Peak queue | Recommended length |
| ----------- | --------- | ---------- | ------------------ |
| Bushy #1095 | 1,564     | 1,042      | 787 m              |
| Mernda #400 | 80        | 3          | 8 m                |

Bushy peak is extreme under single-volunteer defaults — intentional stress test. Mernda peak is 3, so **funnel-not-required callout does not show** (threshold is ≤ 2).

### Not done

- No git commits yet (user rule: commit only when asked)
- No eslint/husky/pre-commit setup (other apps in monorepo have these)
- No chart resize on window resize
- No deployment to johnsy.com
- No tampermonkey-parkrun userscript integration
- No ADR (none were warranted during design)
- `drawQueueDepthChart` untested (canvas rendering)
- Mernda not default-selected in UI (Bushy is first in dropdown)

---

## Key files

```
finish-funnel/
├── CONTEXT.md              # Domain glossary
├── HANDOFF.md              # This file
├── README.md
├── index.html
├── package.json
├── public/fixtures/        # Committed JSON fixtures
├── scripts/build-fixtures.ts
└── src/
    ├── analyzeFinishFunnel.ts   # Main public API
    ├── simulateFinishFunnel.ts
    ├── main.ts                  # UI
    └── __tests/
```

Related existing code (for userscript port later):

- `../tampermonkey-parkrun/lib/assignUnknownFinishTimes.js`
- `../tampermonkey-parkrun/src/parkrun-charts.user.js` (finishers/min chart; skips Unknowns)

---

## Commands

```bash
cd finish-funnel
npm install
npm test
npm run dev          # http://localhost:5173
npm run build:fixtures   # needs /tmp/*.html from curl (see README)
```

---

## Suggested next steps (priority order)

1. **Polish UI** — chart resize; default fixture to Mernda; keyboard/accessibility pass
2. **Tooling** — eslint, prettier, husky (match foretoken/pr-by-pt conventions)
3. **Commit** — atomic conventional commits when user requests
4. **Userscript** — results-page parser handoff to finish-funnel (port proven TS to tampermonkey-parkrun)
5. **Deploy** — johnsy.com hosting alongside other parkrun utilities

---

## Suggested skills

| Skill              | When to use                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `/tdd`             | Continue vertical-slice development (chart resize, userscript parser port)               |
| `grill-with-docs`  | Revisit design if multi-lane, speed-aware deceleration, or threshold UX needs refinement |
| `setup-pre-commit` | Add husky/lint-staged before first commit                                                |
| `prototype`        | Try alternative chart UX or adequacy presentation before committing                      |
| `review`           | Review branch before PR once commits exist                                               |
| `to-issues`        | Break remaining work into grabbable issues if splitting across sessions                  |

---

## Notes for fresh agent

- User prefers **Australian English** in UI copy and docs.
- User rules: prettier, lint, typecheck, tests before commit; conventional commits; atomic changes — but **do not commit unless explicitly asked**.
- parkrun results pages return **403 without a browser User-Agent** when curling fixtures.
- Empty `<div class="compact">` in time cells means **Unknown** — parser handles this.
- Do not duplicate `CONTEXT.md` content into new docs; update glossary there as terms evolve.
