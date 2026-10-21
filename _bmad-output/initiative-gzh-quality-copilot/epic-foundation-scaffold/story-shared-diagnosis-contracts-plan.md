---
title: 'Shared diagnosis contracts'
type: 'chore'
ticket: '3'
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

**Problem:** Review Skills need one shared place for FR-6 article-count degradation and the mandatory four-block report order; `skills/_shared/` only has `.gitkeep`.

**Approach:** Write `skills/_shared/contracts.md` with the PRD FR-6 count bands (including 几乎无稿), ordered blocks 结论→因子→候选→实验, and badge literals `【低置信】` / `【推测】`. No Skill prompts in this ticket.

</frozen-after-approval>

## Implementation Notes

Oneshot: single markdown contract file, well under 100 LOC.

- Wrote `skills/_shared/contracts.md` from PRD FR-6 table (4 bands), FR-12 four-block order, FR-11 badge literals per UX sample-report.
- Left `.gitkeep` in place.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `rg -n '≥30|10–29|&lt;10|几乎无稿|结论|因子|候选|实验|【低置信】|【推测】' skills/_shared/contracts.md` -- expected: all patterns present

**Manual checks (if no CLI):**
- Open `skills/_shared/contracts.md`: four count bands + ordered block names + both badge literals.
