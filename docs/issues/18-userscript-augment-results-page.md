# 18 — Userscript: augment parkrun results page

Tracer-bullet vertical slices for production delivery on live results pages. Glossary: `CONTEXT.md` (**Finish Funnel userscript**, **Augmented results table**, **Finish funnel column**, **Analyse finish funnel**, **Persisted event settings**, **Volunteers roster**).

## Design summary

| Topic       | Decision                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Delivery    | Userscript (production) + dev app (fixtures); shared core, `src/userscript/` entry             |
| Table       | Augment parkrun table; one **Finish funnel column** after Time                                 |
| Display     | Compact: status; detailed: lane, batch, wait metrics, volunteer                                |
| Panel       | **Finish Funnel panel** above results table                                                    |
| Activation  | Event results URL + DOM check + **Analyse finish funnel** button (toggle hide)                 |
| Persistence | Site constraints, layout assumptions, Finish Tokens settings (not layout, not volunteer count) |
| Volunteers  | Parse roster; Finish Tokens → rotation count; Finish Token Support → fetch delay 0             |
| Search/sort | Full results parsed once; re-augment on tbody mutation; no panel search                        |
| Dev app     | Converge on same column markup; retire wide reconstructed table                                |

## Slice 1 (first — end-to-end thin)

- [x] `parseResultsDom` / `parseVolunteersDom` from fixture HTML (extend `parseResultsHtml`)
- [x] `buildFinishFunnelColumnMarkup` (compact + detailed)
- [x] `src/userscript/` entry: activate button, panel mount, column inject
- [x] Tests against sample results HTML fixture
- [x] Dev app: mock parkrun table + single column (replace wide grid)

## Slice 2

- [x] `MutationObserver` re-augment on parkrun search/sort/view toggle
- [x] **Persisted event settings** (localStorage per event path)
- [x] Finish Token Support → zero fetch delay wiring

## Slice 3

- [x] Userscript build (`.user.js` bundle)
- [x] README install instructions
- [x] HANDOFF update

## Done when

Slice 1 tests pass; dev app and userscript share column + panel markup.
