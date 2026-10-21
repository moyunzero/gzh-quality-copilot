---
title: 'Interchange gold sample JSON'
type: 'chore'
ticket: '2'
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

**Problem:** Extension export and Skills paste import need a normative interchange shape; `examples/` has only `.gitkeep` and no AD-3 gold sample yet.

**Approach:** Add `examples/articles.interchange.json` with 2–3 fictional short-fiction articles covering AD-3 seed fields and varied `read_count`, plus a short note that this corpus is intentionally &lt;10 articles for degradation-band fixtures. Optional CSV twin with identical columns.

</frozen-after-approval>

## Implementation Notes

Oneshot: one gold JSON (+ optional CSV twin + fixture note), well under 100 LOC and five content files.

- Wrote `examples/articles.interchange.json` with 3 fictional short-fiction articles; seed fields from AD-3 (required + optional present).
- CSV twin `examples/articles.interchange.csv` with identical columns.
- Fixture note `examples/articles.interchange.fixture-notes.md` documents &lt;10 article-count intent (keeps gold JSON schema clean).
- Removed nothing; left `examples/.gitkeep` in place.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `test -f examples/articles.interchange.json && python3 -c "import json; d=json.load(open('examples/articles.interchange.json')); assert all('title' in a and 'read_count' in a for a in d['articles']); print('OK', len(d['articles']))"` -- expected: OK N (N in 2..3)

**Manual checks (if no CLI):**
- Open gold JSON: each article has `title` and `read_count`; fixture note documents &lt;10 article-count intent.
