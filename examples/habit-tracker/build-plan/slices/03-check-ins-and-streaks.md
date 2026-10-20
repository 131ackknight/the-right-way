# Slice 03: Daily check-ins and streaks

> A self-contained brief for one fresh chat. Everything needed is here or in the files listed under **Read first**. If something is missing, that is a planning bug: note it in the Handoff, do not guess silently.

- **Depends on:** 02
- **Parallel-safe with:** 04
- **Implements:** R-02, R-03

## Goal

Each habit row has today and yesterday toggles and shows current and best streaks that are correct across date boundaries.

## Read first

- `build-plan/SPEC.md`: sections R-02, R-03; decisions D-003, D-004, D-005
- `src/lib/useStore.ts`: how actions are added
- `src/lib/dates.ts`: date helpers
- `src/components/HabitRow.tsx`: where controls mount

## Consumes

- `src/lib/useStore.ts`: `useStore(): { store: Store; activeHabits: Habit[]; actions: StoreActions }`; add new actions through the internal `update(fn)` helper (updated by slice 02 handoff)
- `src/lib/dates.ts`: `today()`, `addDays(date, n)`, `daysBetween(a, b)`
- `src/components/HabitRow.tsx`: `<div data-slot="row-actions">` container

## Produces

- `src/lib/streaks.ts`:
  - `export function currentStreak(dates: string[], todayDate: string): number`
  - `export function bestStreak(dates: string[]): number`
  - `dates` is sorted, unique `YYYY-MM-DD`; both functions are pure.
- `StoreActions.toggleCheckIn(habitId: string, date: string): void`: adds or removes `date` in `store.checkIns[habitId]`, keeping the array sorted and unique. Ignores dates other than today and yesterday (D-004).
- `src/components/CheckInToggle.tsx`: `export function CheckInToggle(props: { habitId: string; date: string; label: string })`
- `src/components/StreakBadge.tsx`: `export function StreakBadge(props: { habitId: string })`

## Tasks

1. Write `streaks.ts` test-first. Cover: empty, today only, yesterday only (streak still alive, D-005), gap of one day, month and year boundaries, best streak in the past longer than current.
2. Add `toggleCheckIn` to `StoreActions` with a unit test for sorting, uniqueness, and the today/yesterday guard.
3. Build `CheckInToggle` (accessible `role="switch"` with `aria-checked`) and `StreakBadge`.
4. Mount two toggles ("Today", "Yesterday") and the badge in each `HabitRow`'s `row-actions` slot.
5. Add one interaction test: toggle today, see the streak go from 0 to 1, reload, still 1.

## Acceptance criteria

- [ ] All R-02 and R-03 acceptance criteria in SPEC.md hold.
- [ ] Days before yesterday cannot be changed through the action, even if called directly.
- [ ] All verify commands pass.

## Verify

```bash
npm test
npm run build
```

## Out of scope

- The 12-week heatmap (slice 04). It reads `store.checkIns` but this slice does not render history.
- Export and import (slice 05).

## Handoff

_Filled in by the builder at the end of the chat. Leave empty when planning._

- **Status:**
- **What changed:**
- **Deviations from this brief:**
- **New or changed contracts:**
- **Notes for downstream slices:**
