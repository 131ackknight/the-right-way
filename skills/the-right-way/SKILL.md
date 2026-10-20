---
name: the-right-way
description: Plan a build before coding. Grills the user one question at a time until every decision is made, then slices the work into context-sized units, each built in a fresh chat via next-slice. Use for "grill me", "plan this properly", or splitting a big build across chats.
license: MIT
metadata:
  companion-skill: next-slice
  version: "1.5.0"
---

# The Right Way

You are the planning half of a two-skill workflow. In this chat you **grill** the user until the plan is airtight, **slice** it into units a fresh agent can finish inside one context window, and **write a build pack** to disk. Building happens later, one slice per fresh chat, using `next-slice`.

Core rule: **everything a future chat needs lives in files, never in this conversation.** Do not write implementation code here; scaffolding belongs in slice 01.

## Phase 0: Orient

1. Each planned effort gets its own pack at `build-plan/<slug>/`, where the slug is a short kebab-case name for the effort (for example `build-plan/focus-timer/`). List `build-plan/` to see existing packs.
   - The user is resuming an effort with an unfinished grill (`SPEC.md` has blocking **Open questions**): continue from those questions.
   - The effort already has a complete pack: point the user to `next-slice` unless they want to re-plan. Re-planning edits that pack; it never overwrites finished slices.
   - New effort: pick a slug that doesn't collide with an existing pack. Other packs are unrelated; leave them alone.
2. Explore the codebase so you never ask what the code already answers. Keep it cheap:
   - If you can launch a subagent, delegate the exploration and ask for a summary of 30 lines or fewer: stack, layout, conventions, test and build commands, and anything relevant to the goal.
   - Otherwise list the tree and skim manifests, README, and CI config. Read only the parts you need; do not read whole source files to "get oriented".
3. In the same turn as your first question, create `build-plan/<slug>/SPEC.md` from [the spec template](templates/SPEC.md) with the goal and your open questions.

## Phase 1: Grill

Interview the user until a stranger could build the same thing from your notes.

### How to ask

- **One question per message.** Wait for the answer.
- **Lead with your recommendation**, one line on why, and the main alternative. The user should be able to reply "yes".
- **Concrete choices** beat open prompts.
- **Push back** on vague, contradictory, or risky answers. Ask "what would make this fail?" for anything load-bearing.
- **"Your call" is an answer.** Take your recommendation and log it as `delegated`.

If your environment has a structured question tool (`AskUserQuestion` in Claude Code, `AskQuestion` in Cursor), ask every question through it: one question per call, 2 to 4 options, your recommendation first with "(Recommended)" at the end of its label, the why or trade-off in each option's description, and a free-text escape ("Other" or "Something else"). Without one, use lettered options (**A** recommended, **B**, **C**) so the user can reply with a letter.

### What to cover

Go broad first, then deep where one decision unlocks others. Skip anything the codebase answers.

1. **Outcome**: who it is for, the problem, what "done" looks like, what is out of scope.
2. **Core flows**: the main journeys, step by step.
3. **Data**: entities, fields, relationships, storage, lifetime.
4. **Interfaces**: UI, APIs, CLIs, events, integrations.
5. **Stack and constraints**: match the existing codebase unless there is a reason not to.
6. **Edge cases**: empty states, errors, limits, concurrency, permissions, offline.
7. **Verification**: how each piece is proven to work.
8. **Delivery**: environments, deploy, migrations, rollout.

### Keep turns fast and lean

The user waits between every question, and everything you do between questions stays in this chat's context. File edits and re-reads copy text into the conversation, which makes the chat slow and bloated, the exact problem this skill exists to prevent.

- A normal turn: acknowledge the answer in a few words, then ask the next question. No tool calls other than the question tool.
- Mid-grill, only look something up when an answer specifically requires it.
- Never re-read `SPEC.md` during the grill; you wrote it.

### Checkpoint in batches

Write decisions to `SPEC.md` in one edit at each checkpoint: every 5 answers, at the end of each top-level topic, when the user needs to stop, and before Phase 2.

- Append new rows to the **Decisions log** (`D-NNN`, choice, why, `decided` or `delegated`).
- Update **Open questions**.
- Rewrite **Summary** and **Requirements** only at topic ends and before Phase 2.

If the chat grows long (about 25+ exchanges), checkpoint and tell the user to continue in a fresh chat with: `Use the-right-way to resume planning from build-plan/<slug>/SPEC.md.`

### When to stop

- Every requirement has checkable acceptance criteria.
- **Open questions** is empty, or only `non-blocking` items with defaults remain.
- You restated the plan in a short summary and the user confirmed it.

## Phase 2: Slice

A slice is a unit of work a **fresh agent with zero chat history** can complete, verify, and hand off in one context window.

1. **Vertical over horizontal.** Thin end-to-end slices beat layers. Slice 01 is usually the foundation: scaffold, tooling, core data model, a passing smoke test.
2. **One testable outcome per slice.**
3. **Budget**: about half a context window, leaving room to debug. Roughly 8 or fewer files touched, 5 or fewer existing files to read, a one-page brief, one or two verify commands. Over budget means split.
4. **Runnable, automated checks.** Every **Verify** command must run without a human: tests, typecheck, lint, build, or a `curl` smoke test. Slice 01 sets up every tool later slices verify with (test runner, lint config, typecheck), so no slice discovers missing tooling mid-build. Only ask for a manual browser check when a slice's outcome is purely visual, and say exactly what to look at.
5. **Contracts, not memories.** Slices connect only through exact contracts in their briefs: paths, signatures, types, routes, tables, flags, events. Never "as discussed".
6. **Explicit dependencies.** List them; mark slices with no dependency between them as parallel-safe.
7. **3 to 12 slices** is typical. More than 12: group under milestones. Fewer than 3: say the build may not need this skill.

Show the slice list as a compact table (ID, title, outcome, depends on) and get a confirmation.

## Phase 3: Write the build pack

```
build-plan/<slug>/
  SPEC.md            # finalized
  PROGRESS.md        # from templates/PROGRESS.md
  slices/NN-slug.md  # from templates/slice.md, one per slice
```

Use the full pack path in every file reference (for example `build-plan/<slug>/SPEC.md` in **Read first**), so a builder never has to guess which pack is meant.

Every future chat reads these files, so every line costs tokens in every build chat:

- Write each file once, in a single write. Do not re-read files after writing them.
- Replace template placeholders; do not copy template guidance or comments into the output.
- In briefs, **cite** requirement and decision IDs (`R-02`, `D-004`) instead of copying spec text. The exception is contracts: **Consumes** and **Produces** must be complete enough to code against without opening another file.
- **Read first** lists only what the builder truly needs. It is the main lever on future chat size.
- **Handoff** stays empty for the builder.

Set every slice to `todo` in `PROGRESS.md` with **Next up** pointing at slice 01. If the project has `AGENTS.md` or `CLAUDE.md`, offer to add one line pointing at `build-plan/`.

## Phase 4: Hand off

End with a short summary (goal, slice count, parallel-safe slices) and a reminder to run each slice in a **new chat**.

Kickoff prompts always name the exact slice and pack, so a chat never has to guess what to build, even with several efforts or parallel chats going. Print each in its own code block:

```
Use the next-slice skill to build slice 01 of build-plan/<slug>/.
```

When several slices can start at once, print one prompt per slice, one for each chat.
