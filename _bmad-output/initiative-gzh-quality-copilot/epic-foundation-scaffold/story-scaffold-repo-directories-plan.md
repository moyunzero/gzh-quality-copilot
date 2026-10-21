---
title: 'Scaffold repo directories'
type: 'chore'
ticket: '1'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'oneshot'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has only `_bmad/` and `_bmad-output/`; architecture Structural Seed folders for Skills, references, examples, and extension do not exist yet.

**Approach:** Create `skills/_shared/`, `references/`, `examples/`, and `extension/` at the project root with `.gitkeep` so empty dirs are commit-ready. No Skill logic, gold JSON, or README content in this ticket.

</frozen-after-approval>

## Implementation Notes

Oneshot: mechanical directory scaffolding only (~4 dirs + gitkeeps), well under 100 LOC and five files of content.

- Created `skills/_shared/`, `references/`, `examples/`, `extension/` with `.gitkeep` each.
- No Skill/README/gold JSON content (owned by later stories).
- VCS: none (`baseline_revision: NO_VCS`).

## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `test -d skills/_shared && test -d references && test -d examples && test -d extension && echo OK` -- expected: OK

**Manual checks (if no CLI):**
- Repo root listing shows the four directories.
