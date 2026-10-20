# Slice 04: History heatmap

> A self-contained brief for one fresh chat. Everything needed is here or in the files listed under **Read first**. If something is missing, that is a planning bug: note it in the Handoff, do not guess silently.

- **Depends on:** 02
- **Parallel-safe with:** 03 (this slice only reads `store.checkIns`; it adds no actions)
- **Implements:** R-04

## Goal

Each habit row can expand to show an accessible 12-week, Monday-first heatmap of its check-ins.

## Read first

- `build-plan/SPEC.md`: section R-04; decisions D-003, D-009
- `src/lib/dates.ts`: date helpers
- `src/components/HabitRow.tsx`: the `row-details` slot

## Consumes

- `src/lib/useStore.ts`: `useStore().store.checkIns` (read only) (updated by slice 02 handoff)
- `src/lib/dates.ts`: `today()`, `addDays(date, n)`
- `src/components/HabitRow.tsx`: `<div data-slot="row-details">` below each row

## Produces

- `src/lib/heatmap.ts`: `export function buildGrid(dates: string[], todayDate: string, weeks = 12): Array<Array<{ date: string; checked: boolean } | null>>`. Returns 7 rows (Monday to Sunday) by `weeks` columns. Future days are `null`.
- `src/components/Heatmap.tsx`: `export function Heatmap(props: { habitId: string })`
- An expand/collapse button on `HabitRow` (`aria-expanded`) that shows `Heatmap` in `row-details`.

## Tasks

1. Write `buildGrid` test-first: today on a Monday, today on a Sunday, a year boundary inside the window, future cells are `null`.
2. Build `Heatmap` as a CSS grid with Tailwind; each cell gets `aria-label="Mon 2026-10-12: checked"` style labels.
3. Add the expand button to `HabitRow` and render `Heatmap` in `row-details`.
4. Add one interaction test with seeded check-ins: expand, count filled cells.

## Acceptance criteria

- [ ] All R-04 acceptance criteria in SPEC.md hold.
- [ ] The grid fits a 360px-wide screen without horizontal scrolling.
- [ ] All verify commands pass.

## Verify

```bash
npm test
npm run build
```

## Out of scope

- Editing check-ins from the heatmap (only today and yesterday are editable, via slice 03).
- Streak numbers (slice 03).

## Handoff

_Filled in by the builder at the end of the chat. Leave empty when planning._

- **Status:**
- **What changed:**
- **Deviations from this brief:**
- **New or changed contracts:**
- **Notes for downstream slices:**
