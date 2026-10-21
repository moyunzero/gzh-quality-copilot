---
title: 'README and LICENSE stubs'
type: 'chore'
ticket: '5'
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

**Problem:** Repo root has no README or LICENSE; later epics need the FR-3 expectation sentence and links to the gold sample and contracts.

**Approach:** Add a stub `README.md` following the UX outline headings, with the FR-3 alignment sentence, install/demo placeholders, and links to `examples/articles.interchange.json`, `examples/sample-report.md`, and `skills/_shared/contracts.md`. Add a `LICENSE` stub that says SPDX is TBD before any public tag. No full privacy/permission matrix (epic-launch-readme-gate).

</frozen-after-approval>

## Implementation Notes

Oneshot: two root stub files, well under 100 LOC.

- README follows UX outline headings; FR-3 sentence verbatim; links gold JSON, contracts, sample-report, LICENSE.
- Install / privacy / bans / paste sections marked 占位 for epic-launch-readme-gate.
- LICENSE stub: SPDX TBD, no public tag until filled.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `rg -n '有历史篇数|examples/articles.interchange.json|skills/_shared/contracts.md' README.md && test -f LICENSE && echo OK` -- expected: FR-3 sentence + both links; OK

**Manual checks (if no CLI):**
- README has the FR-3 sentence and those two links; LICENSE exists and states SPDX TBD.
