---
title: 'Launch gate checklists'
type: 'feature'
ticket: '4'
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

**Problem:** Public tag has no checkable maintainer gate for dogfood vertical cut and Skill-vs-裸聊 contrast; PRD §6.3 items stay untracked.

**Approach:** Add a root `LAUNCH-GATES.md` with markdown checkboxes for (1) maintainer dogfood 竖切 and (2) Skill vs bare-chat same-sample contrast (degradation / evidence / four-block). Each item states what evidence to attach (path + date). One-line README pointer under 贡献 / License. No product features; do not tick the boxes in this ticket.

</frozen-after-approval>

## Implementation Notes

Oneshot: new checklist doc + short README link; UX outline keeps README stranger-facing so gates live in a separate file.
- Added root `LAUNCH-GATES.md` with two unchecked gates + evidence/date blanks.
- README 贡献节加一行指针；未勾选任何门闩（HITL 发版时由维护者填）。

## Plan Change Log

## Review Triage Log

- quick (2026-10-20): no findings.

## Verification

**Commands:**
- `rg -n '^- \\[ \\]|dogfood|裸聊|证据|日期|LAUNCH-GATES' LAUNCH-GATES.md README.md` -- expected: unchecked boxes; both gates; evidence+date cues; README points to LAUNCH-GATES.md
- `test -f LAUNCH-GATES.md` -- expected: exit 0

**Manual checks (if no CLI):**
- A maintainer can tick each gate and knows what file/date to attach without inventing a format.
