# Slice 05: Export and import

- **Depends on:** 03 (both slices add actions to `useStore`; running them in sequence avoids merge conflicts)
- **Parallel-safe with:** none
- **Implements:** R-05

## Goal

A user can download their data as JSON and restore it from a file, with validation and confirmation before anything is replaced.

## Read first

- `build-plan/SPEC.md`: sections R-05, Data model; decision D-008
- `src/lib/useStore.ts`: how actions are added
- `src/lib/types.ts`: `Store`
- `src/App.tsx`: header where the menu mounts

## Consumes

- `src/lib/useStore.ts`: `useStore()`; add new actions through the internal `update(fn)` helper (updated by slice 02 handoff)
- `src/lib/types.ts`: `Store`, `Habit`
- `src/lib/dates.ts`: `today()`

## Produces

- `src/lib/parseImport.ts`: `export function parseImport(json: string): { ok: true; store: Store } | { ok: false; error: string }`. Validates version, shapes, name lengths, and date formats; never throws.
- `StoreActions.replaceStore(next: Store): void`
- `src/components/DataMenu.tsx`: `export function DataMenu()` with Export and Import items, mounted in the header.

## Tasks

1. Write `parseImport` test-first: valid file, wrong version, missing fields, bad dates, non-JSON input.
2. Add `replaceStore` to `StoreActions`.
3. Build `DataMenu`: Export creates a Blob and downloads `streaks-YYYY-MM-DD.json`; Import opens a file picker, runs `parseImport`, then shows a confirmation dialog ("Replace your data with 6 habits from this file?").
4. Add one interaction test: export, clear storage, import the exported string, data restored.

## Acceptance criteria

- [ ] All R-05 acceptance criteria in SPEC.md hold.
- [ ] A rejected import leaves `localStorage` byte-for-byte unchanged.
- [ ] All verify commands pass.

## Verify

```bash
npm test
npm run build
```

## Out of scope

- Merging imported data with existing data (D-008: replace only).
- Cloud backup or sync.

## Handoff

_Filled in by the builder at the end of the chat. Leave empty when planning._

- **Status:**
- **What changed:**
- **Deviations from this brief:**
- **New or changed contracts:**
- **Notes for downstream slices:**
