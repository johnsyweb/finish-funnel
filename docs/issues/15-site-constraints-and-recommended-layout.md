# Site constraints and recommended funnel layout

**Status:** done  
**Blocked by:** #14

## Goal

Run Director specifies **site constraints** (maximum lane length, maximum lane count); model outputs **recommended funnel layout** (lane count and per-lane length) plus explicit adequacy.

## Acceptance

- `recommendFunnelLayout` chooses fewest lanes within constraints, then shortest per-lane length (rounded up)
- When site maxima insufficient, recommend max lanes × max length with explicit shortfall
- Funnel not required still recommends one lane at shortest length
- UI groups: site constraints, layout assumptions, proposed funnel (what-if, clamped)
- Proposed funnel pre-filled from recommendation; re-syncs on fixture, site constraints, or simulation settings change
- Metrics show recommended layout and adequacy; proposed adequacy only when different
- Chart: recommended capacity reference line; proposed line only when different
- Peak queue capacity uses uncapped simulation peak
- Fixture defaults: Bushy 3 × 300 m, Albert Melbourne 2 × 200 m, Mernda 1 × 30 m

## Notes

- Glossary terms in `CONTEXT.md`: site constraints, maximum lane length, maximum lane count, recommended funnel layout
