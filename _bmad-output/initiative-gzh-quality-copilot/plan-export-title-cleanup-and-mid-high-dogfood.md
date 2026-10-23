---
title: 'Export title cleanup (near-dup + 已修改 strip)'
type: 'feature'
ticket: ''
created: '2026-10-23'
status: 'built'
baseline_revision: 'a52f6499f5bf2c627e29fe597366af56a5642de0'
route: 'full'
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

**Problem:** Multi-page export still ships near-duplicate rows (truncated title + tempkey URL vs full `/s/` URL) and dirty「已修改…」title suffixes, so authors get noisy interchange JSON.

**Approach:** Sanitize titles and collapse near-duplicates in the export normalize/merge path so single-page and multi-page downloads both stay clean.

## Boundaries & Constraints

**Always:** Privacy freeze unchanged; interchange schema / `GOLD_KEYS` unchanged; reuse `mergePageRows` / `normalizeArticles`; near-dup survivor prefers `/s/` (or `/s?`) URL, then longer sanitized title, else first-seen; close/rewrite the matching title-cleanup deferred-work row when done.

**Never:** New hosts; scrape other accounts; change Skill/contracts/eval fixtures or rubric; mid/high dated dogfood runs (deferred separately); live WeChat required for unit path.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dirty「已修改」title | Title ends with「已修改」/「已修改…」 | Suffix stripped before export/dedupe | No error |
| Near-dup pair | Truncated+tempkey vs fuller+/s/ | One row: prefer `/s/`, then longer title, else first-seen | No error |
| Distinct articles | Different titles and URLs | Both kept | No error |
| Unchecked single-page | Opt-in off | Same cleanup via normalize path | Existing errors |

**Decisions (2026-10-23):** Near-dup survivor = `/s/` → longer sanitized title → first-seen. Mid/high dated dogfood split out at token gate (see deferred-work).

</frozen-after-approval>

## Code Map

- `extension/src/logic.ts` — `rowDedupeKey` / `mergePageRows` exact title+url; `normalizeArticles` passes title through. **Extend:** strip「已修改」; near-dup collapse with preference; pure helpers + unit tests.
- `extension/src/content-list.ts` — leave extract titles raw; do not overload `normalizeTitleForMatch`.
- `extension/test/pagination.test.mjs` (and extract tests if normalize-owned) — strip + near-dup matrix; existing merge tests stay green.
- `_bmad-output/.../deferred-work.md` — close title-cleanup product row with evidence.
- Do **not** change: privacy freeze, Skill/contracts, `dogfood/eval/sample*.json`, gold schema.

## Tasks & Acceptance

**Execution:**
- [x] `extension/src/logic.ts` -- Title sanitize + near-dup collapse; wire into normalize and/or merge for all export paths.
- [x] `extension/test/*.mjs` -- Unit-test strip + preference matrix; `npm test` green; `npm run build`.
- [x] `_bmad-output/.../deferred-work.md` -- Close/rewrite title-cleanup deferred row with evidence.

**Acceptance Criteria:**
- Given a title with「已修改…」suffix, when normalized/exported, then suffix is gone; other fields intact.
- Given a near-dup pair, when merged/normalized together, then exactly one preferred row remains.
- Given distinct articles, when merged, then both remain.
- Given privacy-lock / pagination tests, when suite runs, then they still pass.

## Implementation Notes

- `sanitizeExportTitle` strips trailing「已修改」/「已修改…」/「已修改...」(+ 原创/whitespace); used by `rowDedupeKey`, `normalizeArticle(title)`, near-dup helpers.
- Near-dup: title equal or prefix (shorter ≥ 6) + URL class share(`/s/`|`/s?`) vs non-share; survivor `/s/` → longer title → first-seen.
- `mergePageRows` + `normalizeArticles` both collapse so multi-page merge and single-page export stay clean. `content-list` extract titles left raw.

## Plan Change Log

- 2026-10-23: Implemented title sanitize + near-dup collapse; closed deferred title-cleanup row; mid/high dogfood remains deferred.

## Review Triage Log

- 2026-10-23 quick — 2 findings. Patched: `collapseNearDupRows` loop-to-stable (three-row tempkey+/s/ residual); deferred-work mid/high duplicate closed as superseded. verdicts: medium→patched ×2. No intent_gap/bad_plan/defer.

## Design Notes

After sanitize, detect near-dups via title-prefix / shared identity plus URL class (list tempkey vs `/s/`). Survivor order: `/s/` URL → longer sanitized title → first-seen.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: all pass
- `cd extension && npm run build` -- expected: bundles updated

**Manual checks:**
- Maintainer (optional): reload extension; multi-page export on a dirty account — fewer near-dups / no「已修改」suffixes.
