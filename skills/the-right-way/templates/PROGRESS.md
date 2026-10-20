# Progress: <project or feature name>

> Source of truth across chats. Every `next-slice` chat reads this first and updates it last. If this file disagrees with anything else, this file wins until someone fixes it.

## Next up

**<NN>: <slice title>** (`slices/<NN>-<slug>.md`)

Kickoff prompt for a fresh chat:

```
Use the next-slice skill to build the next slice in build-plan/.
```

## Slices

| ID | Slice | Status | Depends on | Parallel-safe with | Brief |
| --- | --- | --- | --- | --- | --- |
| 01 | <title> | todo | none | none | [01](slices/01-<slug>.md) |
| 02 | <title> | todo | 01 | 03 | [02](slices/02-<slug>.md) |
| 03 | <title> | todo | 01 | 02 | [03](slices/03-<slug>.md) |

Status is one of:

- `todo`: not started.
- `doing (YYYY-MM-DD)`: claimed by a chat. If a new chat finds this, the previous chat was interrupted; resume it.
- `done (YYYY-MM-DD)`: acceptance criteria verified and handoff written.
- `blocked: <reason>`: cannot proceed without a human decision.
- `split into <NN>a, <NN>b`: replaced by smaller slices listed below it.

## Discovered work

Things found while building that are outside the current slice's scope. Triage these into new slices or the spec; do not fix them mid-slice.

- <none yet>

## Log

One line per finished chat, newest last.

- <YYYY-MM-DD> <NN> done. <one-line outcome>
