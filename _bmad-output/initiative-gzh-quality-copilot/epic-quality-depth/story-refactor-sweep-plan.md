---
title: 'Refactor sweep'
type: 'chore'
ticket: '4'
created: '2026-10-21'
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

**Approach:** Inspect 5.1–5.3 Review Triage Logs, `deferred-work.md`, and product trees touched by this epic (`extension/`, `skills/`, `dogfood/eval/`). Land leftover cleanup only. Do not add FR coverage. Explicitly drop items that stay outside this epic (keep them in deferred-work).

</frozen-after-approval>

## Implementation Notes

Oneshot: inspect-first; one leftover doc cleanup from 5.1 plan prose; no product code change.

- 5.1 triage (metrics merge, WeUI harvest, publish_time, inject): code already patched; HITL passed same day (`dogfood/2026-10-20/extension-smoke.md`).
- 5.2 triage (sf cite, 04 shape, mirrors, samples): already patched; ticket done.
- 5.3 triage (eval howto/rubric clarity): already patched; plan `built` (await user `done`).
- Product trees: no TODO/FIXME/后续票; `npm test` 33 pass.
- Explicitly **dropped** for this epic (no new product scope): (1) pre-export「已登录本号？」status; (2) auto-pagination — both remain in `deferred-work.md` from epic-3.
- Cleanup landed: cleared stale 5.1 Notes/Triage “HITL still pending/deferred” (contradicted by same-day dogfood pass); aligned 5.1 Verification permissions assert with freeze (`scripting`).
- Appended epic-5 sweep entry to `deferred-work.md`.
- VCS: none (`baseline_revision: NO_VCS`) — no commit.

## Plan Change Log

## Review Triage Log

- medium (claimed), patch — quick review: 5.1 triage still said HITL deferred while dogfood showed pass → false as open product debt; true as stale plan prose → rewritten Notes/Triage + scripting assert; deferred-work sweep entry updated.
- Skipped lenses: none beyond pinned `quick`.

## Verification

**Commands:**
- `rg -n 'TODO|FIXME|后续票' extension/src skills/gzh-review skills/_shared dogfood/eval --glob '!**/node_modules/**'` -- expected: no matches
- `cd extension && npm test` -- expected: all pass
- `rg -n 'Epic-5 refactor sweep' _bmad-output/initiative-gzh-quality-copilot/deferred-work.md` -- expected: hit

**Manual checks:**
- 5.1–5.3 triage patches are in-tree; login-status + auto-pagination remain deferred.
