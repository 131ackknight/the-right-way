# Spec: Streaks, a local-first habit tracker

> Single source of truth for *what* is being built and *why*. Written during the grill by `the-right-way`; read in part by every `next-slice` chat. Keep it compact: builders load only the sections their brief cites.

## Summary

Streaks is a single-user web app for tracking daily habits. You add a few habits, tap once a day to check each one off, and see your current streak, best streak, and a 12-week history. There are no accounts: data lives in the browser and can be exported or imported as JSON. Done means a person can use it daily for a month without losing data or needing help.

## Out of scope

- Accounts, sign-in, cloud sync, or multi-device.
- Reminders and push notifications.
- Non-daily schedules (weekdays only, 3x per week, and so on).
- Categories, tags, notes, or habit icons.
- Native mobile apps. The web app must work well on a phone browser.

## Requirements

### R-01: Manage habits

Create, rename, and archive habits.

**Acceptance criteria**
- [ ] A habit can be created with a name of 1 to 40 characters (trimmed). Empty or longer names show an inline error.
- [ ] At most 20 active habits. The add form is disabled with an explanation at the limit.
- [ ] A habit can be renamed in place with the same validation.
- [ ] Archiving hides a habit from the main list but keeps its check-in history.

### R-02: Daily check-in

**Acceptance criteria**
- [ ] Each active habit has a one-tap toggle for today.
- [ ] Yesterday can also be toggled (for forgotten check-ins). Earlier days cannot be edited.
- [ ] Toggling is instant and survives a reload.

### R-03: Streaks

**Acceptance criteria**
- [ ] Current streak is the number of consecutive checked days ending today, or ending yesterday if today is not checked yet.
- [ ] Best streak is the longest run of consecutive checked days ever.
- [ ] Both are shown on every habit row.

### R-04: History heatmap

**Acceptance criteria**
- [ ] Each habit can expand to show the last 12 weeks as a 7-row grid (Monday first), one cell per day.
- [ ] Checked days are filled; future days are not rendered.
- [ ] Each cell has an accessible label with the date and status.

### R-05: Export and import

**Acceptance criteria**
- [ ] Export downloads `streaks-YYYY-MM-DD.json` containing the full store.
- [ ] Import accepts a previously exported file, validates it, shows a confirmation with habit count, and replaces current data only after confirmation.
- [ ] Invalid files show a clear error and change nothing.

### R-06: Persistence

**Acceptance criteria**
- [ ] All state is saved to `localStorage` under the key `streaks:v1` on every change.
- [ ] Corrupt or missing storage loads an empty store without crashing.

## Data model

```ts
type Habit = {
  id: string;          // crypto.randomUUID()
  name: string;        // 1-40 chars, trimmed
  createdAt: string;   // ISO date, YYYY-MM-DD, local time
  archivedAt: string | null;
};

type Store = {
  version: 1;
  habits: Habit[];
  checkIns: Record<string, string[]>; // habitId -> sorted unique YYYY-MM-DD dates
};
```

## Interfaces

- One page, mobile-first. Header with app name and an overflow menu (Export, Import).
- Main list of active habit rows: name, today toggle, yesterday toggle, current and best streak, expand button for the heatmap.
- Add-habit form pinned at the bottom of the list.
- Archived habits are hidden (no UI to view them in v1).

## Stack and constraints

- **Language / framework:** TypeScript (strict), React 19, Vite.
- **Styling:** Tailwind CSS v4. No component library.
- **Storage:** `localStorage` only, via `src/lib/store.ts`. No other module touches `localStorage`.
- **Testing:** Vitest + Testing Library. Pure logic in `src/lib/` gets unit tests; components get one interaction test each.
- **Hosting / runtime:** static build, any static host. Modern evergreen browsers.
- **Conventions:** components in `src/components/` (PascalCase files), logic in `src/lib/` (camelCase files), no default exports, dates always handled as local `YYYY-MM-DD` strings via `src/lib/dates.ts`.

## Decisions log

| ID | Decision | Why | Status |
| --- | --- | --- | --- |
| D-001 | Local-first with `localStorage`, no backend | Single user, zero hosting cost, instant UX | decided |
| D-002 | Vite + React + TypeScript | Fast static build; matches the user's existing skills | delegated |
| D-003 | Dates stored as local `YYYY-MM-DD` strings | Avoids timezone bugs from storing timestamps for day-level data | delegated |
| D-004 | Allow editing yesterday, not earlier | Forgiveness for late check-ins without making history meaningless | decided |
| D-005 | Streak survives until end of today if yesterday was checked | Users should not see a streak "break" in the morning before checking in | decided |
| D-006 | Archive instead of delete | Protects history from accidental loss; delete can come later | decided |
| D-007 | Max 20 active habits | Keeps the list usable on a phone; user said they track about 5 | delegated |
| D-008 | Import replaces rather than merges | Merge rules add complexity the user does not need | decided |
| D-009 | Monday-first week in the heatmap | User's preference | decided |
| D-010 | Single `useStore()` hook with actions instead of one hook per entity (made in slice 02) | Check-ins and habits share one persisted object; one hook avoids double writes | decided |

## Open questions

- [ ] Should archived habits be viewable and restorable? (non-blocking, default: no UI in v1, logged in PROGRESS discovered work)
