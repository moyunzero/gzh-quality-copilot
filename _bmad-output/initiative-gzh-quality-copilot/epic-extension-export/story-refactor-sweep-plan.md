---
title: 'Refactor sweep'
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

**Problem:** The epic closes with a sweep so deferred review leftovers cannot silently remain.

**Approach:** Inspect 3.1–3.3 Review Triage Logs, `deferred-work.md` epic-3 entries, and `extension/` sources. Land leftover cleanup only. Do not add FR coverage. Explicitly drop items that stay outside this epic (keep them in deferred-work).

</frozen-after-approval>

## Implementation Notes

Oneshot: inspect-only; no leftover code patch required.

- 3.1 triage (reduce-motion, data-URL download, bottom progress, details height): already patched in popup CSS/TS.
- 3.2 triage (busy lock, isMpListUrl align, bracket-balanced JSON): already patched; `defer` login-status left in deferred-work.
- 3.3 triage (privacy-lock test gaps, freeze wording): already patched.
- `extension/src` + popup + tests: no TODO/FIXME/后续票.
- Explicitly **dropped** for this epic (no new product scope): (1) pre-export「已登录本号？」status; (2) auto-pagination full-list export — both remain in `deferred-work.md` for later.
- Dropped empty extra edits.
- VCS: none (`baseline_revision: NO_VCS`).

## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `rg -n 'TODO|FIXME|后续票' extension/src extension/popup.html extension/test --glob '!**/node_modules/**'` -- expected: no matches
- `cd extension && npm test` -- expected: all pass

**Manual checks (if no CLI):**
- 3.1–3.3 triage patches are in-tree or listed as dropped in Implementation Notes.
