# Progress: Streaks, a local-first habit tracker

## Next up

**03: Daily check-ins and streaks** (`slices/03-check-ins-and-streaks.md`)

Slice 04 is parallel-safe with 03 and can be started in a separate chat now.

```
Use the next-slice skill to build the next slice in build-plan/.
```

## Slices

| ID | Slice | Status | Depends on | Parallel-safe with | Brief |
| --- | --- | --- | --- | --- | --- |
| 01 | Foundation: scaffold, store, dates | done (2026-10-18) | none | none | [01](slices/01-foundation.md) |
| 02 | Manage habits | done (2026-10-19) | 01 | none | [02](slices/02-manage-habits.md) |
| 03 | Daily check-ins and streaks | todo | 02 | 04 | [03](slices/03-check-ins-and-streaks.md) |
| 04 | History heatmap | todo | 02 | 03 | [04](slices/04-history-heatmap.md) |
| 05 | Export and import | todo | 03 | none | [05](slices/05-export-import.md) |

## Discovered work

- Archived habits cannot be viewed or restored (found in slice 02). Not required by R-01; candidate for a future slice. Tracked as a non-blocking open question in SPEC.md.
- `npm run lint` warns about React Refresh on `src/lib/useStore.ts` exporting a non-component (found in slice 02). Harmless; revisit if the warning becomes noisy.

## Log

- 2026-10-18 01 done. Vite + React + TS + Tailwind scaffold, typed store with safe load/save, date helpers, 9 passing tests.
- 2026-10-19 02 done. Add, rename, and archive habits with validation and limit. Changed `useHabits()` to `useStore()` (D-010); updated briefs 03, 04, 05.
