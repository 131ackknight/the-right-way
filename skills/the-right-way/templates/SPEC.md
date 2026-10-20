# Spec: <project or feature name>

> Single source of truth for *what* is being built and *why*. Written during the grill by `the-right-way`; read in part by every `next-slice` chat. Keep it compact: builders load only the sections their brief cites.

## Summary

<Two to four sentences: who it is for, the problem it solves, and what "done" looks like.>

## Out of scope

- <Things deliberately not being built, so no slice drifts into them.>

## Requirements

Each requirement has an ID that slice briefs reference.

### R-01: <short name>

<What the system must do.>

**Acceptance criteria**
- [ ] <Checkable statement.>
- [ ] <Checkable statement.>

### R-02: <short name>

<What the system must do.>

**Acceptance criteria**
- [ ] <Checkable statement.>

## Data model

<Entities, fields, types, relationships, and where they are stored. Use a table or a typed snippet.>

## Interfaces

<UI surfaces, routes, API endpoints, CLI commands, events, and external integrations.>

## Stack and constraints

- **Language / framework:** <...>
- **Storage:** <...>
- **Testing:** <...>
- **Hosting / runtime:** <...>
- **Conventions:** <naming, formatting, folder layout the builder must follow>

## Decisions log

Every decision made during the grill. Builders may append new ones (noting the slice) but never rewrite old ones; supersede instead.

| ID | Decision | Why | Status |
| --- | --- | --- | --- |
| D-001 | <choice> | <reason> | decided |
| D-002 | <choice> | <reason> | delegated |

Status is one of: `decided` (user chose), `delegated` (user said "your call"), `superseded by D-NNN`.

## Open questions

Must be empty, or contain only `non-blocking` items with a default, before slicing.

- [ ] <question> (blocking)
- [ ] <question> (non-blocking, default: <default>)
