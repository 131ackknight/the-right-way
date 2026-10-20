# Slice 02: Manage habits

- **Depends on:** 01
- **Parallel-safe with:** none
- **Implements:** R-01

## Goal

A user can add, rename, and archive habits, and the list survives a reload.

## Read first

- `build-plan/SPEC.md`: sections R-01, Interfaces; decisions D-006, D-007
- `src/lib/types.ts`, `src/lib/store.ts`: the store contract
- `src/App.tsx`: where the list mounts

## Consumes

- `src/lib/types.ts`: `Habit`, `Store`
- `src/lib/store.ts`: `loadStore(): Store`, `saveStore(store: Store): void`
- `src/lib/dates.ts`: `today(): string`

## Produces

- `src/lib/useHabits.ts`: `export function useHabits(): { habits: Habit[]; add(name: string): void; rename(id: string, name: string): void; archive(id: string): void }` (active habits only)
- `src/lib/validateName.ts`: `export function validateName(name: string): string | null` (returns an error message or null)
- `src/components/HabitList.tsx`: `export function HabitList()`
- `src/components/HabitRow.tsx`: `export function HabitRow(props: { habit: Habit })` with a `data-slot="row-actions"` container where later slices add controls
- `src/components/AddHabitForm.tsx`: `export function AddHabitForm()`

## Tasks

1. Write `validateName` with unit tests (trim, empty, 40-char limit).
2. Write `useHabits`: holds `Store` in React state initialized from `loadStore()`, calls `saveStore` on every change.
3. Build `AddHabitForm` with inline errors and the 20-habit limit.
4. Build `HabitRow` with inline rename and an archive button.
5. Build `HabitList` and mount it in `App`.
6. Add one interaction test: add, rename, archive, reload.

## Acceptance criteria

- [x] All R-01 acceptance criteria in SPEC.md hold.
- [x] Data survives a full page reload.
- [x] All verify commands pass.

## Verify

```bash
npm test
npm run build
```

## Out of scope

- Check-in toggles and streaks (slice 03).
- Heatmap (slice 04).
- Viewing or restoring archived habits (not in v1).

## Handoff

- **Status:** done
- **What changed:** `src/lib/useStore.ts`, `src/lib/validateName.ts`, `src/lib/validateName.test.ts`, `src/components/HabitList.tsx`, `src/components/HabitRow.tsx`, `src/components/AddHabitForm.tsx`, `src/components/HabitList.test.tsx`, `src/App.tsx`.
- **Deviations from this brief:** Built `useStore()` instead of `useHabits()`. Slice 03 needs to write check-ins into the same persisted object, and two hooks each holding a copy of `Store` would overwrite each other's saves. Logged as D-010 in SPEC.md.
- **New or changed contracts:**
  - `src/lib/useStore.ts`: `export function useStore(): { store: Store; activeHabits: Habit[]; actions: StoreActions }`
  - `export type StoreActions = { addHabit(name: string): void; renameHabit(id: string, name: string): void; archiveHabit(id: string): void }`
  - State lives in a React context: `export function StoreProvider(props: { children: ReactNode })`, already wrapped around `App` in `src/main.tsx`.
  - To add an action, extend `StoreActions` and implement it in the `actions` object inside `StoreProvider`. Every action goes through the internal `update(fn: (s: Store) => Store)` helper, which persists the result.
- **Notes for downstream slices:** Briefs 03, 04, and 05 were updated to consume `useStore()`. `HabitRow` exposes `<div data-slot="row-actions">` for extra controls, and a `<div data-slot="row-details">` below the row for expandable content (added for slice 04).
