# Slice 01: Foundation: scaffold, store, dates

- **Depends on:** none
- **Parallel-safe with:** none
- **Implements:** R-06 (fully), groundwork for all others

## Goal

A running Vite + React + TypeScript app with a typed, persisted store and date helpers, proven by passing unit tests.

## Read first

- `build-plan/streaks/SPEC.md`: sections Data model, Stack and constraints; decisions D-001, D-002, D-003

## Consumes

- Nothing. Empty repository.

## Produces

- `package.json` scripts: `dev`, `build`, `test` (Vitest, run mode), `lint`.
- `src/lib/types.ts`: `export type Habit`, `export type Store` exactly as in SPEC.md Data model.
- `src/lib/store.ts`:
  - `export const STORAGE_KEY = "streaks:v1"`
  - `export function emptyStore(): Store`
  - `export function loadStore(): Store` (never throws; corrupt or missing data returns `emptyStore()`)
  - `export function saveStore(store: Store): void`
- `src/lib/dates.ts`:
  - `export function today(): string` (local `YYYY-MM-DD`)
  - `export function addDays(date: string, n: number): string`
  - `export function daysBetween(a: string, b: string): number` (b minus a, in whole days)
- `src/App.tsx`: `export function App()` rendering the app shell (header with "Streaks").

## Tasks

1. Scaffold with `npm create vite@latest` (React + TypeScript template), enable `strict`, remove demo content.
2. Add Tailwind CSS v4 via the Vite plugin.
3. Add Vitest, jsdom, and Testing Library; wire `npm test` to `vitest run`.
4. Write `types.ts`, `store.ts`, and `dates.ts` with the exact exports above.
5. Unit test `store.ts` (round trip, corrupt JSON, wrong version) and `dates.ts` (month and year boundaries, DST week).
6. Render the app shell in `App.tsx`.

## Acceptance criteria

- [x] `npm run dev` serves the shell with the "Streaks" header.
- [x] `loadStore()` returns `emptyStore()` for missing, corrupt, or wrong-version data.
- [x] Date helpers are correct across month, year, and DST boundaries.
- [x] All verify commands pass.

## Verify

```bash
npm test
npm run build
```

## Out of scope

- Any habit UI (slice 02).
- A React hook around the store (slice 02).

## Handoff

- **Status:** done
- **What changed:** Vite scaffold; `src/lib/types.ts`, `src/lib/store.ts`, `src/lib/dates.ts`, `src/lib/store.test.ts`, `src/lib/dates.test.ts`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `vite.config.ts`, `vitest.setup.ts`.
- **Deviations from this brief:** none.
- **New or changed contracts:** none. All exports match **Produces**.
- **Notes for downstream slices:** `dates.ts` builds dates with `new Date(y, m - 1, d)` to stay in local time; never parse `YYYY-MM-DD` with `new Date(string)`, which treats it as UTC. 9 tests pass.
