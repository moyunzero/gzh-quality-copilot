---
title: 'Sample four-block report'
type: 'chore'
ticket: '4'
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

**Problem:** FR-13 needs a demo report showing the four-block skeleton and badge literals; `examples/` has gold JSON but no `sample-report.md`.

**Approach:** Add `examples/sample-report.md` in contracts.md heading order, with evidence-snippet style and at least one `【推测】` or `【低置信】`. Shape matches UX `.working/sample-report.md`; content uses the 3-article gold fixture (&lt;10 band: no personal ranking).

</frozen-after-approval>

## Implementation Notes

Oneshot: one Markdown report, well under 100 LOC.

- Wrote `examples/sample-report.md` with UX heading labels `## 01 结论` … `## 04 实验`.
- Used gold fixture (3 articles) so the demo is &lt;10: no ranking; evidence cites interchange titles/rows; `【推测】` on a structure guess with no snippet.
- Review patch: removed `【低置信】` from &lt;10 header (that badge is high-count / low-read only); replaced read-volume 「周四」推测 with a no-evidence structure guess.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- medium, patch — `【低置信】` on &lt;10 header: contracts/UX reserve that badge for high-count / low-read. Removed from header; kept `【推测】` to satisfy verify.
- medium, patch — factor 3 claimed Thursday/late-night reads better, contradicting gold JSON and &lt;10 no-rank rule. Replaced with a snippet-less structure speculation.

## Verification

**Commands:**
- `rg -n '^## 01 结论|^## 02 因子|^## 03 候选|^## 04 实验|【推测】|【低置信】' examples/sample-report.md` -- expected: four headings in order plus at least one badge

**Manual checks (if no CLI):**
- Open `examples/sample-report.md`: four headed sections 结论→因子→候选→实验; badge literal present.
