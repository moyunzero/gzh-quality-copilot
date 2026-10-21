---
title: 'Opt-in multi-page export with cancel'
type: 'feature'
ticket: '2'
created: '2026-10-21'
status: 'built'
baseline_revision: 'a2d06e4a11bc2041b5543c3182374102fd4edd8a'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Export only reads the current list page (~10 rows). Authors with multi-page history cannot get a full-account sample without manual flipping; CAP-2 requires opt-in walk-all + mid-run cancel.

**Approach:** Add an unchecked-by-default「翻完所有页」control. When checked, export walks subsequent pages via content-script pagination + extract, merging/deduping rows; show 取消 during the run and stop with a visible reason. Unchecked keeps today’s current-page-only path.

## Boundaries & Constraints

**Always:** Privacy freeze (downloads/tabs/scripting + `mp.weixin.qq.com` only); own-account list only; default unchecked = current page; cancel must stop an in-flight multi-page run; paste CTA / fixture export remain; reuse `extractArticlesFromDocument` / normalize path.

**Never:** New hosts; article-detail navigation; scraping other accounts; changing Skill/contracts/eval; requiring multi-page for UJ-1; infinite loops without a safety page cap.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Unchecked export | List tab, opt-in off | Same as today: one-page extract → download | Existing errors |
| Checked, multi-page | Opt-in on; pager has next | Merged rows > page-one alone; status shows progress/stop reason | Soft-fail page with status |
| Checked, single page | Opt-in on; no next control | Same count as one page; end reason「已到末页」or equivalent | No error |
| Cancel mid-run | Opt-in on; user hits 取消 | Stops; downloads partial if any rows collected OR clear cancelled status without lying | Visible「已取消」 |
| Off-list / not ready | Non-list tab | No multi-page; existing status path | No download |
| Pager click fails | Next control missing/disabled mid-walk | Stop with reason; keep rows so far if any | Status + paste CTA if empty |

</frozen-after-approval>

## Code Map

- `extension/src/logic.ts` — Add message types for multi-page start/cancel/progress (or extend EXTRACT payload with `{ multiPage: true }`); keep `EXTRACT_MESSAGE` single-page for unchecked. Shared constants for cancel/end reasons.
- `extension/src/content-list.ts` — Today: current-page only, comment L753. Add: find-next-page control (WeUI/下一页 heuristics), click + wait for list change, loop extract→merge→dedupe by normalized title/url; abort flag for cancel; **no** `location` assign to article URLs. Export pure helpers (`mergePageRows`, `findNextPageControl`, loop driver) for unit tests with HTML fixtures.
- `extension/src/popup.ts` / `popup.html` / `popup.css` — Checkbox「翻完所有页」default off; 取消 button visible only while multi-page running; wire cancel message; progress/status copy for walking/cancelled/end.
- `extension/fixtures/` — Multi-page HTML fixtures (page A / page B + next control) for offline pager tests; do not require live MP for CI.
- `extension/test/*.mjs` — Cover matrix: unchecked path unchanged; merge grows across pages; cancel aborts; privacy-lock still green.
- Continuity from 6.1 — Keep `tabExportContext` / pre-export status; do not regress load-time status.
- Spec — `spec-maturity-post-mvp` CAP-2; epic Notes unknown: fragile selectors → fixture + HITL.

## Tasks & Acceptance

**Execution:**
- [ ] `extension/src/logic.ts` -- Message/types + any pure merge/dedupe helpers shared with content tests.
- [ ] `extension/src/content-list.ts` -- Multi-page walk + cancel flag + next-control heuristics; keep single-page extract as default handler.
- [ ] `extension/popup.html` + `popup.css` + `popup.ts` -- Opt-in checkbox; cancel during run; status reasons; unchecked export path unchanged.
- [ ] `extension/fixtures/` + `extension/test/` -- Fixture-driven pager/merge/cancel tests; rebuild via `npm run build`; `npm test` green.
- [ ] HITL note -- Maintainer: unchecked vs checked on real multi-page list; cancel once; record in Implementation Notes.

**Acceptance Criteria:**
- Given opt-in unchecked on a list tab, when 导出, then result matches single-page behavior.
- Given opt-in checked with a next-page control (fixture or live), when export finishes, then article count exceeds page-one-only.
- Given a multi-page run in progress, when 取消, then walk stops and UI shows cancelled (with partial download only if rows already collected — be consistent and documented in status).
- Given privacy-lock tests, when suite runs, then they still pass.

## Implementation Notes

- HITL: unchecked vs checked on real multi-page list; cancel once mid-walk; reload unpacked extension after build.
- CI: `walkListPages` / `mergePageRows` unit tests; popup wiring source asserts. Live WeUI selectors remain fragile.

## Plan Change Log

## Review Triage Log

- 2026-10-21 quick — 6 findings verified. Patched: stuck-click→error; poll waitAfterClick; skip disabled next (continue); empty cancel→paste CTA; end copy「已到末页」; findNext unit tests. Deferred: live HTML pager fixture not loaded in CI (unit mocks cover heuristics; HITL for WeUI). verdicts high/medium→patched; unused fixture→defer.

## Design Notes

Orchestrate the walk **inside the content script** (popup may close if focus is lost; cancel works while popup stays open and sends abort). Prefer text/WeUI selectors for「下一页」; treat missing/disabled next as end. Safety cap (e.g. 50 pages) prevents runaway. Deduplicate by `normalizeTitleForMatch` + url when present. After cancel/end, leave the tab on the last visited list page (no forced return to page 1). Partial download on cancel: **yes if ≥1 row collected**, else status-only + paste CTA.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: all pass
- `cd extension && npm run build` -- expected: popup.js + content-list.js updated

**Manual checks:**
- Unchecked export on list = one page; checked walks; cancel mid-way shows 已取消; reload extension after build.
