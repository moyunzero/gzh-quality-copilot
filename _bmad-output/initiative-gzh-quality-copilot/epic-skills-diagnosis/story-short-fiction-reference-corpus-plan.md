---
title: 'Short-fiction reference corpus'
type: 'chore'
ticket: '2'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'oneshot'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-8 needs an auditable short-fiction structure corpus; `references/` is empty except `.gitkeep`.

**Approach:** Add a provenance index plus ≥5 human-annotated structure summaries at repo-root `references/`. Each entry has a structure-signal note and an auditable source-type/sample line. No third-party full text.

</frozen-after-approval>

## Implementation Notes

Oneshot: index + five short summary files (mechanical, same shape).

- Wrote `references/index.md` and `sf-01`…`sf-05`. Each has 结构信号 + 出处. Provenance: maintainer teaching notes, no third-party full text.
- Left `references/.gitkeep` in place.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- low, patch — sf-04/sf-05 provenance still said「开场形态」while signals are whole-piece beat / last line. Sample lines now match each signal.

## Verification

**Commands:**
- `test $(ls references/sf-*.md | wc -l) -ge 5 && rg -l '结构信号|出处' references/sf-*.md | wc -l` -- expected: ≥5 files, each matching both headings

**Manual checks (if no CLI):**
- Open `references/index.md` and five summaries: signal + provenance; no full articles.
