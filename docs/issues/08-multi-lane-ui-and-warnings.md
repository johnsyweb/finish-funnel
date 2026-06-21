# Multi-lane UI, metrics, and warnings

**Type:** AFK  
**Blocked by:** [07-assign-finisher-lanes](./07-assign-finisher-lanes.md)

## What to build

Replace single **proposed funnel (m)** input with **lane count** and **lane length (m)**. Fixture defaults: Bushy 2 × 300 m, Mernda 1 × 30 m.

Metrics panel:

- Peak queue depth (unchanged)
- Minimum lanes required at configured lane length
- Combined lane capacity and proposed layout adequacy

Chart reference line uses combined lane capacity.

Warning callout when combined capacity &lt; peak queue depth (finish-line backup not yet modelled; mutually exclusive with funnel-not-required callout).

Lane layout changes do not reset selected moment.

## Acceptance criteria

- [x] Lane count and lane length inputs with fixture-aware defaults
- [x] Minimum lanes required shown instead of single-lane recommended metres
- [x] Chart proposed-capacity line reflects combined lane capacity
- [x] Finish-line backup warning when layout insufficient at peak
- [x] Accessible labels; Australian English copy
- [x] `mise run check` passes

## Blocked by

- #07 Assign finisher lanes
