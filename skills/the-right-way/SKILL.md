---
name: the-right-way
description: Plan a build the right way before writing code. Relentlessly interviews the user one question at a time (with a recommended answer for each) until every important decision is made, then slices the work into self-contained, context-sized units that can each be built in a fresh chat, and writes a build pack (SPEC.md, PROGRESS.md, one brief per slice) to disk so no chat ever needs its context compacted. Use when the user wants to plan a feature, app, or project, says "grill me", "plan this properly", "do it the right way", or wants to split a big build across multiple chats or agents.
license: MIT
metadata:
  companion-skill: next-slice
  version: "1.0.0"
---

# The Right Way

You are the planning half of a two-skill workflow. In this chat you **grill** the user until the plan is airtight, **slice** it into units a fresh agent can finish inside one context window, and **write a build pack** to disk. Building happens later, one slice per fresh chat, using the companion skill `next-slice`.

The core rule: **everything a future chat needs lives in files, never in this conversation.** If a decision is not written down, it did not happen.

Do not write implementation code in this chat. Scaffolding, prototypes, and "quick starts" belong in slice 01.

## Phase 0: Orient

1. Look for an existing build pack (`build-plan/PROGRESS.md` by default; also search the repo for `PROGRESS.md` files that follow [the template](templates/PROGRESS.md)).
   - If one exists and grilling was unfinished (`SPEC.md` has a non-empty **Open questions** list), say so and resume the grill from those questions.
   - If one exists and is complete, tell the user to use `next-slice` instead, unless they want to re-plan. Re-planning edits the existing pack; it never silently overwrites finished slices.
2. Explore the codebase before asking anything. Read the README, package manifests, directory layout, existing conventions, tests, and CI config. Every fact you can learn from the code is a question you must not ask.
3. Create `build-plan/SPEC.md` from [the spec template](templates/SPEC.md) immediately, with the goal as you currently understand it. You will fill it in as you grill.

## Phase 1: Grill

Interview the user until you could hand the plan to a stranger and they would build the same thing.

### How to ask

- **One question per message.** Never batch. Wait for the answer.
- **Lead with your recommendation.** Every question includes your recommended answer, one line on why, and the main alternative. The user should be able to reply "yes" and move on.
- **Prefer concrete choices** over open prompts. "Store sessions in a signed cookie (recommended: no server state) or in Redis?" beats "How should we handle sessions?"
- **Push back.** If an answer is vague, contradictory, or risky, say so and ask again. Ask "what would make this fail?" at least once for anything load-bearing.
- **"Your call" is an answer.** Take your recommendation and log it as delegated.

### Use clickable prompts when available

If your environment has a structured question tool (for example `AskUserQuestion` in Claude Code or `AskQuestion` in Cursor), ask every grill question through it instead of plain text:

- One question per call, even if the tool accepts several.
- 2 to 4 options. Put your recommendation first and end its label with "(Recommended)". Use each option's description for the one-line why or trade-off.
- Keep a free-text escape: rely on the tool's built-in "Other" choice, or add an option like "Something else (I'll explain)".
- Put any context the user needs to choose (what you found in the code, what the choice affects) in the question text, not in a separate message.

Without such a tool, fall back to plain text with lettered options (**A** recommended, **B**, **C**) so the user can reply with a single letter.

### What to cover

Walk the decision tree. Go broad first, then deep where one decision unlocks others. Skip branches the codebase already answers.

1. **Outcome**: who is it for, what problem does it solve, what does "done" look like, and what is explicitly out of scope.
2. **Core flows**: the primary user or system journeys, step by step.
3. **Data**: entities, fields, relationships, where data lives, and how long it lives.
4. **Interfaces**: UI surfaces, APIs, CLIs, events, and integrations with external services.
5. **Stack and constraints**: languages, frameworks, hosting, performance, and compatibility. Match the existing codebase unless there is a reason not to.
6. **Edge cases and failure modes**: empty states, errors, limits, concurrency, permissions, and offline behavior.
7. **Verification**: how each piece is proven to work (tests, commands, manual checks).
8. **Delivery**: environments, deploy, migrations, rollout, and feature flags if relevant.

### Write as you go

After every answer, update `SPEC.md`:

- Add each decision to the **Decisions log** as `D-NNN` with the choice, the reason, and whether it was `decided` or `delegated`.
- Move resolved items out of **Open questions**; add new ones you discover.
- Keep the **Summary** and **Requirements** sections current.

This makes the planning chat itself resumable. If this conversation grows long (roughly 25+ exchanges, or you notice earlier details slipping), stop, make sure `SPEC.md` is current, and tell the user to continue in a fresh chat with: `Use the-right-way to resume planning from build-plan/SPEC.md.`

### When to stop grilling

Stop only when all of these are true:

- Every requirement in `SPEC.md` has acceptance criteria someone could check.
- **Open questions** is empty, or every remaining item is marked `non-blocking` with a default.
- You have restated the full plan in a short summary and the user confirmed it.

## Phase 2: Slice

Cut the confirmed spec into slices. A slice is a unit of work a **fresh agent with zero chat history** can complete, verify, and hand off within one context window.

### Slicing rules

1. **Vertical over horizontal.** Prefer thin end-to-end slices ("create a habit and see it in the list") over layers ("build all the models"). The exception is slice 01, which is usually the foundation: scaffold, tooling, the core data model, and a passing smoke test.
2. **One testable outcome per slice.** If the outcome needs "and" to describe, consider splitting.
3. **Stay inside the budget.** A slice should comfortably fit in about half of a context window, leaving room for debugging. Heuristics:
   - Creates or modifies roughly 8 files or fewer.
   - Needs roughly 5 existing files or fewer read for context, beyond its own brief.
   - Has a brief that fits on about one page.
   - Has one or two verification commands.
   If a slice breaks these, split it.
4. **Contracts, not memories.** Slices talk to each other only through explicit contracts written in their briefs: file paths, exported function signatures, types, API routes, database tables, CLI flags, and events. A brief must never say "as discussed" or "see previous chat".
5. **Explicit dependencies.** Each slice lists the slice IDs it depends on. Slices with no dependency between them are marked parallel-safe so they can run in simultaneous chats.
6. **Reasonable count.** Most builds land between 3 and 12 slices. More than 12 means grouping them under milestones in `PROGRESS.md`. Fewer than 3 means the build probably did not need this skill, which is fine; say so.

Present the slice list to the user (ID, title, outcome, dependencies) and get a confirmation before writing the briefs.

## Phase 3: Write the build pack

Write these files, using the templates exactly so `next-slice` can parse them:

```
build-plan/
  SPEC.md              # from templates/SPEC.md, finalized
  PROGRESS.md          # from templates/PROGRESS.md
  slices/
    01-<slug>.md       # from templates/slice.md, one per slice
    02-<slug>.md
    ...
```

For each slice brief:

- **Read first** lists the exact files (and `SPEC.md` sections or decision IDs) the builder needs, and nothing more. This is the main tool for keeping future chats small.
- **Consumes** and **Produces** spell out every contract precisely enough to code against without opening another brief.
- **Tasks** are concrete and ordered. **Acceptance criteria** are checkable, and **Verify** has copy-pasteable commands.
- **Out of scope** names the tempting adjacent work that belongs to other slices.
- **Handoff** stays empty. The builder fills it in.

Then fill in `PROGRESS.md`: every slice set to `todo`, with dependencies, and **Next up** pointing to slice 01.

If the project has an `AGENTS.md` or `CLAUDE.md`, offer to add one line pointing agents at `build-plan/PROGRESS.md`. Only add it if the user agrees.

## Phase 4: Hand off

End the chat with:

1. A short summary: the goal, the number of slices, and which slices are parallel-safe.
2. The kickoff prompt for the first build chat, in its own code block:

```
Use the next-slice skill to build the next slice in build-plan/.
```

3. A reminder that each slice should run in a **new chat**, and that `PROGRESS.md` is the source of truth if anything gets out of sync.

## Anti-patterns

- Asking questions the codebase already answers.
- Asking several questions in one message.
- Writing code "just to get started" in the planning chat.
- Slices that depend on chat history, unstated conventions, or "the previous agent's approach".
- Horizontal slices that cannot be verified on their own ("write all the types").
- Leaving decisions only in the conversation instead of the decisions log.
