---
name: next-slice
description: Build exactly one slice of a build pack made by the-right-way, in a fresh chat. Loads only that slice's brief, builds and verifies it, writes a handoff, and updates PROGRESS.md for the next chat. Use for "next slice", "build slice NN", or a build-plan/ folder.
license: MIT
metadata:
  companion-skill: the-right-way
  version: "1.5.0"
---

# Next Slice

You are the building half of a two-skill workflow. A previous chat used `the-right-way` to write a build pack to disk. Your job: **build one slice, prove it works, leave clean notes, and stop.** The next slice happens in a new chat.

You have no memory of earlier chats and must not need any. Protect two budgets:

- **Context:** every file you read and every command output stays in this chat.
- **Round trips:** every tool call costs a full model turn. Batch independent reads and searches into one parallel step, and do bookkeeping in a few combined edits rather than many small ones.

## Step 1: Pick the slice

Find the pack. Kickoff prompts name it, for example `build slice 03 of build-plan/focus-timer/`.

- If the prompt names a pack path, use it.
- If not, list `build-plan/`. One pack: use it. Several: show each pack with its **Next up** and ask which one; never guess. None: tell the user to plan with `the-right-way` first.
- Older packs may sit directly in `build-plan/` (with `build-plan/PROGRESS.md`); treat that folder as the pack.

Open the pack's `PROGRESS.md`. You only need **Next up** and the **Slices** table.

Status values: `todo`, `doing (date)`, `done (date)`, `blocked: reason`, `split into NNa, NNb`.

1. If the prompt names a slice, build that one, once its dependencies are `done`. If it is already `doing`, ask whether another chat is still on it before touching it; if the user says it was interrupted, resume it (see the end of this file).
2. If no slice is named, take the lowest-numbered `todo` slice whose dependencies are all `done`. Never take over a `doing` slice unprompted: it may be another chat working right now. Mention any `doing` slices in your report so the user can say if one was interrupted.
3. If nothing is ready, say why and stop.

Claim it right away by setting it to `doing (YYYY-MM-DD)`, so other chats skip it.

## Step 2: Load only what the brief lists

- Read the slice brief, then read everything its **Read first** names in one parallel batch.
- Read files under about 300 lines whole: one read beats a search plus a ranged read. For larger files, including a large `SPEC.md`, read only the named sections.
- Do not read other briefs, upstream Handoffs, or the wider codebase by default. Upstream contract changes have already been copied into this brief's **Consumes**.

## Step 3: Pre-flight the contracts

Confirm the **Consumes** items exist with the stated shape using one combined search (a single pattern matching all the names), not one search per item. Skip any you already saw while reading **Read first**.

- Matches: continue.
- Differs: now read the relevant upstream Handoff. If it explains the change, code against reality and note it. If nothing explains it, set the slice to `blocked: <reason>`, tell the user, and stop.

## Step 4: Build

- Work through **Tasks** in order, following the conventions in `SPEC.md` and the existing code.
- Create every **Produces** item exactly as written. Changing a contract is allowed, but it must go in the Handoff and be propagated (Step 6).
- Respect **Out of scope**. Note anything outside the slice and add it to **Discovered work** during Step 6, not mid-build.
- For decisions the spec does not cover, make the smallest reasonable call and note it for Step 6. Ask only if it is expensive to reverse.
- While building, run only the tests for what you are working on. Save full checks for Step 5.
- Do not re-read files you just wrote.

**Split, don't sprawl.** If you are reading far beyond **Read first**, the work is clearly bigger than the brief (for example double the files), or debugging is dragging on:

1. Stop at a clean, working point. Never leave the build broken.
2. Write the Handoff with `Status: partial`.
3. Write the remaining work as `slices/NNa-slug.md` (and `NNb`, and so on), with the same structure as this brief, consuming what you just built.
4. Set this slice to `split into NNa, NNb` in `PROGRESS.md`, add the new rows, and go to Step 7.

## Step 5: Verify

- Run each check once: the **Verify** commands, plus typecheck and lint if the project has them and **Verify** does not already cover them. Do not run the test suite a second time if **Verify** already runs it.
- Keep the output small: use quiet or summary reporters (for example `vitest run --reporter=dot`, `pytest -q`, `npm run build --silent`). Only print full output for what failed, and re-run just the failing test while fixing it.
- Check an acceptance box only when it is actually true. Never mark a slice `done` with failing checks it caused. If it cannot pass within budget, split.
- **Pre-existing failures:** if a check fails in code this slice did not touch, confirm it is unrelated (it fails without your changes, or clearly concerns other code). Do not fix it. Log it in **Discovered work** and the Handoff, and the slice can still be `done`. If it blocks your own **Verify** commands, set the slice to `blocked` instead.
- **Missing tooling:** if a **Verify** command cannot run because setup is missing (for example no lint config), add the minimal setup and record it as a deviation.
- **No manual browser passes** unless **Verify** explicitly asks for one. Driving a browser costs many round trips and large screenshots. Prefer the brief's automated checks; for a quick smoke test of a page, fetch it with `curl` and check the status and key text.

## Step 6: Hand off

Do this in as few edits as possible: one to the brief, one to `PROGRESS.md`, and one to `SPEC.md` only if there are new decisions.

1. In the brief, tick the acceptance boxes and fill in **Handoff** in the same edit, briefly:
   - **Status:** `done` or `partial`.
   - **What changed:** the files, as one list.
   - **Deviations from this brief:** what differs and why.
   - **New or changed contracts:** exact signatures, paths, or shapes that differ from **Produces**.
   - **Notes for downstream slices:** gotchas only.
2. If a contract changed, edit the **Consumes** lines of each downstream brief that uses it. Find those briefs via the **Depends on** column. Touch only those lines.
3. In `PROGRESS.md`, in one edit: set the slice to `done (YYYY-MM-DD)`, point **Next up** at the next ready slice, add any **Discovered work**, and add one line to **Log**.
4. Append any new decisions to the `SPEC.md` decisions log as `D-NNN (slice NN)`.

## Step 7: Commit and stop

- If the project uses git, commit the code and build-pack updates together as `slice NN: title`, unless the repo has its own conventions.
- Report in a few lines: what was built, how it was verified, and any deviations or discovered work. Name any parallel-safe slices that can start now. If every slice is `done`, summarize and suggest a final review against `SPEC.md`.
- End with kickoff prompts naming the exact slice and pack, one code block per slice that is ready now (one per parallel chat), then stop:

```
Use the next-slice skill to build slice 04 of build-plan/<slug>/.
```

## Resuming an interrupted slice

Only when the user confirms the slice was interrupted: run `git status` and `git diff --stat` (not the full diff) and read any partial Handoff. Then continue from the first incomplete task without redoing finished work.
