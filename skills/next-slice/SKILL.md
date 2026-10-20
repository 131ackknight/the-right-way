---
name: next-slice
description: Build exactly one slice of a build pack made by the-right-way, in a fresh chat. Loads only that slice's brief, builds and verifies it, writes a handoff, and updates PROGRESS.md for the next chat. Use for "next slice", "continue the build", or a build-plan/ folder.
license: MIT
metadata:
  companion-skill: the-right-way
  version: "1.2.0"
---

# Next Slice

You are the building half of a two-skill workflow. A previous chat used `the-right-way` to write a build pack to disk. Your job: **build one slice, prove it works, leave clean notes, and stop.** The next slice happens in a new chat.

You have no memory of earlier chats and must not need any. Context is the budget you are protecting: every file you read and every command output stays in this chat.

## Step 1: Pick the slice

Open `build-plan/PROGRESS.md` (or search for a `PROGRESS.md` with a **Slices** table; if there is none, tell the user to plan with `the-right-way` first). You only need **Next up** and the **Slices** table.

Status values: `todo`, `doing (date)`, `done (date)`, `blocked: reason`, `split into NNa, NNb`.

1. If the user named a slice, use it once its dependencies are `done`.
2. Else, if a slice is `doing`, a previous chat was interrupted: resume it (see the end of this file).
3. Else, take the lowest-numbered `todo` slice whose dependencies are all `done`.
4. If nothing is ready, say why and stop.

Claim it right away by setting it to `doing (YYYY-MM-DD)`, so parallel chats pick something else.

## Step 2: Load only what the brief lists

- Read the slice brief.
- For **Read first**, read only what it names. For `SPEC.md` sections and decision IDs, search for the heading or ID and read just that range, not the whole spec.
- Do not read other briefs, upstream Handoffs, or the wider codebase by default. Upstream contract changes have already been copied into this brief's **Consumes**.

## Step 3: Pre-flight the contracts

Confirm each **Consumes** item exists with the stated shape by searching for it (the export, route, table, or type). Do not open whole files to check.

- Matches: continue.
- Differs: now read the relevant upstream Handoff. If it explains the change, code against reality and note it. If nothing explains it, set the slice to `blocked: <reason>`, tell the user, and stop.

## Step 4: Build

- Work through **Tasks** in order, following the conventions in `SPEC.md` and the existing code.
- Create every **Produces** item exactly as written. Changing a contract is allowed, but it must go in the Handoff and be propagated (Step 6).
- Respect **Out of scope**. For anything outside the slice, add one line to **Discovered work** in `PROGRESS.md` and move on.
- For decisions the spec does not cover, make the smallest reasonable call and append it to the `SPEC.md` decisions log as `D-NNN (slice NN)`. Ask only if it is expensive to reverse.
- Keep reads cheap: read large files in ranges, and do not re-read files you just wrote.

**Split, don't sprawl.** If you are reading far beyond **Read first**, the work is clearly bigger than the brief (for example double the files), or debugging is dragging on:

1. Stop at a clean, working point. Never leave the build broken.
2. Write the Handoff with `Status: partial`.
3. Write the remaining work as `slices/NNa-slug.md` (and `NNb`, and so on), with the same structure as this brief, consuming what you just built.
4. Set this slice to `split into NNa, NNb` in `PROGRESS.md`, add the new rows, and go to Step 7.

## Step 5: Verify

- Run every **Verify** command, plus the project's existing test, lint, and typecheck commands.
- Keep the output small: use quiet or summary reporters (for example `vitest run --reporter=dot`, `pytest -q`, `npm run build --silent`). Only print full output for what failed, and re-run just the failing test while fixing it.
- Check an acceptance box only when it is actually true. Never mark a slice `done` with failing checks. If it cannot pass within budget, split.

## Step 6: Hand off

1. Fill in the brief's **Handoff**, briefly:
   - **Status:** `done` or `partial`.
   - **What changed:** the files, as one list.
   - **Deviations from this brief:** what differs and why.
   - **New or changed contracts:** exact signatures, paths, or shapes that differ from **Produces**.
   - **Notes for downstream slices:** gotchas only.
2. If a contract changed, edit the **Consumes** lines of each downstream brief that uses it. Find those briefs via the **Depends on** column. Touch only those lines.
3. In `PROGRESS.md`: set the slice to `done (YYYY-MM-DD)`, point **Next up** at the next ready slice, and add one line to **Log**.

## Step 7: Commit and stop

- If the project uses git, commit the code and build-pack updates together as `slice NN: title`, unless the repo has its own conventions.
- Report in a few lines: what was built, how it was verified, and any deviations or discovered work. Name any parallel-safe slices that can start now. If every slice is `done`, summarize and suggest a final review against `SPEC.md`.
- End with the kickoff prompt in its own code block, then stop:

```
Use the next-slice skill to build the next slice in build-plan/.
```

## Resuming an interrupted slice

Run `git status` and `git diff --stat` (not the full diff) and read any partial Handoff. Then continue from the first incomplete task without redoing finished work.
