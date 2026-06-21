# Queue moment summary and physical batch on every row

**Type:** AFK  
**Blocked by:** [11-finish-line-backup-simulation](./11-finish-line-backup-simulation.md)

## What to build

Replace the single-line queue depth paragraph with a **queue moment summary** (`<dl>` per lane: utilisation in finishers and metres, physical batches nested under each lane). Show **physical batch** on every queue table row; batch marker holder gets letter plus card badge.

Wire `queueMomentSummaryFromAssignments` through `queuedFinishersAtMoment` and update section heading to `Queue at selected moment (N)`.

## Acceptance criteria

- [x] Physical batch (`unnamed`, `A`, `B`, …) assigned to every multi-lane finisher
- [x] Batch marker holder flagged; table batch column shows letter on all rows, card badge on holder
- [x] Queue moment summary lists all lanes including empty; batches with count ≥ 1 only
- [x] Single-lane summary shows utilisation only (no batch nesting)
- [x] Finish-line blocked line when backup modelled
- [x] `mise run check` passes

## Blocked by

- #11 Finish-line backup simulation
