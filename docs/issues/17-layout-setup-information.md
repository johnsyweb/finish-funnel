# 17 — Layout setup information (On the day)

Operational panel for event-day roping prep, derived from **layout** and **layout assumptions**.

## Scope

- **Cordon stake spacing** input in Layout assumptions (default 5 m, minimum 1 m)
- **On the day** panel after metrics, before chart
- **Cordon stake count**: N + 1 cordon lines × (⌈L / S⌉ + 1) stakes per line
- **Batch marker cards needed** moved here from queue moment summary (multi-lane only)
- Always shown when layout is configured, including **funnel not required**

## Glossary

See `CONTEXT.md`: **Layout setup information**, **Cordon stake spacing**, **Cordon line**.

## Done when

- [x] `cordonStakeCount` pure function with tests
- [x] `buildLayoutSetupMarkup` with tests
- [x] UI input, panel mount, wiring in `main.ts`
- [x] Batch marker card count removed from queue moment summary
- [x] `CONTEXT.md` updated
