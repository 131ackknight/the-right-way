---
name: next-slice
description: Build exactly one slice from a build pack created by the-right-way skill, in a fresh chat. Reads build-plan/PROGRESS.md, claims the next ready slice, loads only that slice's brief and the files it lists, builds and verifies it against its acceptance criteria, writes a handoff, updates downstream briefs and PROGRESS.md, and prints the kickoff prompt for the next chat. Splits the slice instead of letting context grow if it runs over budget. Use when the user says "next slice", "build the next slice", "continue the build", or points at a build-plan/ folder.
license: MIT
metadata:
  companion-skill: the-right-way
  version: "1.0.0"
---

# Next Slice

You are the building half of a two-skill workflow. A previous chat used `the-right-way` to plan the build and write a build pack to disk. Your job: **build one slice, prove it works, leave clean notes, and stop.** The next slice happens in a new chat.

You have no memory of earlier chats, and you must not need any. If the build pack does not tell you something, the codebase does, or it is a planning gap you record.

## Step 1: Find the build pack

- Default location: `build-plan/`. If it is not there, search the repo for a `PROGRESS.md` with a **Slices** table.
- If there is no build pack, stop and tell the user to plan first with `the-right-way`.

## Step 2: Pick the slice

Read `PROGRESS.md` in full. Then choose:

1. If the user named a slice ID, use it, after checking its dependencies are `done`.
2. Otherwise, if any slice is `doing`, a previous chat was interrupted. Resume that slice (see "Resuming" below).
3. Otherwise, take the lowest-numbered `todo` slice whose dependencies are all `done`.
4. If nothing is ready, report why (blocked slices, unmet dependencies) and stop.

Claim it right away: set its status to `doing (YYYY-MM-DD)` in `PROGRESS.md`. This tells parallel chats to pick something else.

## Step 3: Load context, and only that context

- Read the slice brief in full.
- Read exactly what its **Read first** section lists: the named `SPEC.md` sections and decision IDs, and the named files.
- Read the **Handoff** sections of the slices it depends on. They record deviations that may have changed a contract.
- Do not read other slice briefs, the whole spec, or the whole codebase "to get oriented". Context is the budget you are protecting.

## Step 4: Pre-flight the contracts

For every item under **Consumes**, confirm it exists on disk with the stated shape (search for the export, route, table, or type).

- If it matches, continue.
- If it differs and an upstream Handoff explains the change, code against the real version and note it.
- If it is missing or conflicts with no explanation, stop. Set the slice to `blocked: <reason>`, tell the user what is wrong, and suggest which slice needs fixing.

## Step 5: Build

- Work through **Tasks** in order. Match the conventions in `SPEC.md` (Stack and constraints) and the existing code.
- Create every item under **Produces** exactly as specified. If you must change a contract, that is allowed, but it must be recorded in the Handoff and propagated (Step 7).
- Stay in scope. Respect **Out of scope**. When you find a bug or improvement outside this slice, add one line to **Discovered work** in `PROGRESS.md` and keep going.
- When you need to make a decision the spec does not cover, make the smallest reasonable call, then append it to the `SPEC.md` decisions log as a new `D-NNN` with "made in slice NN". Ask the user only if the decision is expensive to reverse.

### Budget watch: split, don't sprawl

Stop and split if any of these happen:

- You have read many files beyond **Read first** and still need more.
- The work is clearly larger than the brief suggested (for example, double the files).
- You have gone through several rounds of debugging and the conversation is getting long.

To split:

1. Get the code to a clean, working stopping point. Never leave the build broken.
2. Write the Handoff with `Status: partial` and exactly what is done.
3. Create new brief files `slices/<NN>a-<slug>.md` (and `<NN>b`, and so on) for the remaining work, following the same structure as the current brief. Their **Consumes** must include what you just built.
4. In `PROGRESS.md`, set this slice to `split into <NN>a, <NN>b` and add rows for the new slices.
5. Jump to Step 8 and hand off.

## Step 6: Verify

- Run every command under **Verify**. Then check each **Acceptance criteria** box only when it is actually true.
- Run the project's existing test, lint, and typecheck commands if they exist.
- If something fails, fix it within this slice. If it cannot be fixed within budget, split (see above). Never mark a slice `done` with failing verification.

## Step 7: Write the handoff and propagate

1. Fill in the slice's **Handoff** section:
   - **Status:** `done` or `partial`.
   - **What changed:** files created or modified, in one short list.
   - **Deviations from this brief:** anything built differently, and why.
   - **New or changed contracts:** exact signatures, paths, or shapes that differ from **Produces**.
   - **Notes for downstream slices:** gotchas, commands, or setup the next builder needs.
2. If any contract changed, open each downstream brief that consumes it (find them via the **Depends on** column in `PROGRESS.md`) and update its **Consumes** section to match reality. This is the one time you edit other briefs.
3. Update `PROGRESS.md`:
   - Set the slice to `done (YYYY-MM-DD)`.
   - Update **Next up** to the next ready slice.
   - Add one line to **Log**.

## Step 8: Commit and hand off

- If the project uses git, commit the slice's work and the build pack updates together as `slice <NN>: <title>`, unless the user or repo conventions say otherwise.
- End with a short report:
  - What was built and how it was verified.
  - Any deviations, new decisions, or discovered work.
  - The kickoff prompt for the next chat, in its own code block:

```
Use the next-slice skill to build the next slice in build-plan/.
```

- If slices are parallel-safe, say which ones can be started in separate chats right now.
- If every slice is `done`, say so, summarize the build, and suggest a final review pass against the requirements in `SPEC.md`.

Then stop. Do not start the next slice in this chat.

## Resuming an interrupted slice

When a slice is already `doing`:

1. Check `git status` and `git log` for work from the interrupted chat.
2. Read any partially filled Handoff in the brief.
3. Compare what exists against **Tasks** and **Produces**, then continue from the first incomplete task. Do not redo finished work.

## Anti-patterns

- Building more than one slice in a chat.
- Reading the whole repo or every brief before starting.
- Silently changing a contract without updating the Handoff and downstream briefs.
- Fixing out-of-scope issues instead of logging them in **Discovered work**.
- Marking `done` without running **Verify**.
- Letting the context grow instead of splitting.
