# Example: Streaks habit tracker

This is a real build pack produced by `the-right-way`, frozen **mid-build**: slices 01 and 02 are done, and 03 is next. It shows what a fresh chat sees when it runs `next-slice`.

| File | What to look at |
| --- | --- |
| [build-plan/streaks/SPEC.md](build-plan/streaks/SPEC.md) | Requirements with checkable acceptance criteria, and a decisions log where each choice records why it was made and whether the user decided it or delegated it. |
| [build-plan/streaks/PROGRESS.md](build-plan/streaks/PROGRESS.md) | The slice table, dependencies, parallel-safe pairs, discovered work, and the log. |
| [build-plan/streaks/slices/02-manage-habits.md](build-plan/streaks/slices/02-manage-habits.md) | A finished slice. The builder changed a contract (`useHabits()` became `useStore()`), recorded why in the Handoff, logged decision D-010, and updated the downstream briefs. |
| [build-plan/streaks/slices/03-check-ins-and-streaks.md](build-plan/streaks/slices/03-check-ins-and-streaks.md) | The next slice. Its **Consumes** section already reflects slice 02's change, so the next chat never needs slice 02's conversation. |

## How the grill went (excerpt)

The planning chat asks one question at a time and always leads with a recommendation:

> **Agent:** Should streaks break at midnight, or survive until the end of today if yesterday was checked?
> **Recommended:** survive until end of today. Otherwise every user sees their streak "break" each morning before they check in.
> **Alternative:** break at midnight. It is stricter, but feels punishing.
>
> **User:** yeah survive
>
> *(logged as D-005, decided)*

> **Agent:** Max number of active habits? I can't find a constraint in your notes.
> **Recommended:** 20. It keeps the list usable on a phone, and you said you track about 5.
>
> **User:** your call
>
> *(logged as D-007, delegated)*

> **Agent:** On import, merge with existing data or replace it?
> **Recommended:** replace, with a confirmation step. Merge needs conflict rules for duplicate habits and overlapping dates, and you haven't described a need for it.
> **What would make this fail:** someone imports an old backup over newer data. The confirmation dialog shows the habit count to make that obvious.
>
> **User:** replace is fine
>
> *(logged as D-008, decided)*

After about 20 questions the open questions list was empty. The agent proposed five slices, the user confirmed, and the agent wrote this pack and printed the kickoff prompt:

```
Use the next-slice skill to build slice 01 of build-plan/streaks/.
```
