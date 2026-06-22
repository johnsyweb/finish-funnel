# Queue depth chart legend

**Status:** done  
**Blocked by:** #15

## Goal

Add a dynamic HTML legend below the queue depth chart naming each visible plot element.

## Acceptance

- Legend below canvas; style-matched swatches (solid/dashed horizontal, vertical for batch markers)
- Labels: Queue depth, Peak queue capacity, Recommended capacity, Proposed capacity (when shown), Batch marker moment (multi-lane with markers)
- Dynamic visibility matches chart drawing rules; selected moment excluded
- Canvas `aria-describedby` points to legend list; swatches `aria-hidden`

## Notes

- Glossary: chart legend, queue depth chart in `CONTEXT.md`
