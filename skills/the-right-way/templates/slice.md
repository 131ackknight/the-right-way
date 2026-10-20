# Slice <NN>: <title>

> A self-contained brief for one fresh chat. Everything needed is here or in the files listed under **Read first**. If something is missing, that is a planning bug: note it in the Handoff, do not guess silently.

- **Depends on:** <slice IDs, or "none">
- **Parallel-safe with:** <slice IDs, or "none">
- **Implements:** <requirement IDs from SPEC.md, e.g. R-02, R-03>

## Goal

<One sentence describing the single testable outcome of this slice.>

## Read first

Load these and nothing else unless you get stuck:

- `build-plan/SPEC.md`: sections <Summary, Data model>; decisions <D-003, D-007>
- `<path/to/existing/file>`: <why it matters>

## Consumes

Contracts this slice relies on, provided by earlier slices or the existing codebase. Verify each exists before starting.

- `<path>`: `<exported signature or type>`
- `<route or table or event>`: <shape>

## Produces

Contracts this slice must create exactly as written. Later slices code against these.

- `<path>`: `<exported signature or type>`
- `<route or table or event>`: <shape>

## Tasks

1. <Concrete, ordered step.>
2. <Concrete, ordered step.>
3. <Concrete, ordered step.>

## Acceptance criteria

- [ ] <Checkable statement tied to a requirement.>
- [ ] <Checkable statement.>
- [ ] All verify commands pass.

## Verify

```bash
<command that proves the slice works>
```

## Out of scope

- <Tempting adjacent work that belongs to slice NN.>

## Handoff

_Filled in by the builder at the end of the chat. Leave empty when planning._

- **Status:**
- **What changed:**
- **Deviations from this brief:**
- **New or changed contracts:**
- **Notes for downstream slices:**
