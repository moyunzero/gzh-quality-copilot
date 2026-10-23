---
title: 'Opt-in multi-page export with cancel'
type: 'feature'
ticket: '2'
created: '2026-10-21'
status: done
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
- [x] `extension/src/logic.ts` -- Message/types + any pure merge/dedupe helpers shared with content tests.
- [x] `extension/src/content-list.ts` -- Multi-page walk + cancel flag + next-control heuristics; keep single-page extract as default handler.
- [x] `extension/popup.html` + `popup.css` + `popup.ts` -- Opt-in checkbox; cancel during run; status reasons; unchecked export path unchanged.
- [x] `extension/fixtures/` + `extension/test/` -- Fixture-driven pager/merge/cancel tests; rebuild via `npm run build`; `npm test` green.
- [x] HITL note -- Maintainer: unchecked vs checked on real multi-page list; cancel once; record in Implementation Notes.

**Acceptance Criteria:**
- Given opt-in unchecked on a list tab, when 导出, then result matches single-page behavior.
- Given opt-in checked with a next-page control (fixture or live), when export finishes, then article count exceeds page-one-only.
- Given a multi-page run in progress, when 取消, then walk stops and UI shows cancelled (with partial download only if rows already collected — be consistent and documented in status).
- Given privacy-lock tests, when suite runs, then they still pass.

## Implementation Notes

- HITL 2026-10-21: 16-page account; opt-in checked → SW `begin=` URL walk completed; `articles.interchange.json` downloaded with multi-page rows (> page one). Known leftover (out of 6.2 scope): truncated-title + tempkey URL near-duplicates vs full `/s/` rows; dirty「已修改」title suffixes.
- CI: `walkListPages` / `mergePageRows` / `computeNextListPageUrl` unit tests; popup + background wiring asserts. Live WeUI click path kept as fallback; production multi-page uses SW URL orchestration.

## Plan Change Log

- 2026-10-21 — Multi-page driver moved to service worker + `begin`/`count` URL navigation after DOM click + full-reload killed the content script at page 2 and SW long-wait aborted download.

## Review Triage Log

- 2026-10-21 quick — 6 findings verified. Patched: stuck-click→error; poll waitAfterClick; skip disabled next (continue); empty cancel→paste CTA; end copy「已到末页」; findNext unit tests. Deferred: live HTML pager fixture not loaded in CI (unit mocks cover heuristics; HITL for WeUI). verdicts high/medium→patched; unused fixture→defer.
- 2026-10-22 full (group-1 extension) — decision option 3 hybrid; 5 patches applied (cancel unlock, delete dead finish helpers, waitTab complete-only, SW mutex+try navigate via `runUrlMultiExportLoop`, executable SW/PAGE_META/opt-in tests). 2 defer (pager underestimate, data-URL size). `npm test` 53 pass.
- 2026-10-22 re-review — decision option 3 (cancel copy + block until SW idle); 5 patches applied (`BG_MULTI_STATUS` poll, cancel-before-ack clear, `tabWaitShouldFinish`+get, download try/catch, gate/wait/navigate-reject tests). 1 defer (stray complete URL). `npm test` 56 pass.

## Design Notes

Orchestrate the walk **in the service worker** via `begin`/`count` list URLs (WeChat list full-reloads; content-script click walk dies after page 1→2). Content script answers sync `EXTRACT_LIST_PAGE_META` (rows + nextUrl). Popup kicks `BG_START_MULTI_EXPORT` and may close; cancel sets SW flag. Safety cap 50 pages. Deduplicate by title+url. Leave tab on last visited list page. Partial download on cancel: **yes if ≥1 row collected**, else status-only + paste CTA.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: all pass
- `cd extension && npm run build` -- expected: popup.js + content-list.js updated

**Manual checks:**
- Unchecked export on list = one page; checked walks; cancel mid-way shows 已取消; reload extension after build.

## Code Review

### 2026-10-22
**Code review complete.** 0 `decision-needed`, 5 `patch`, 2 `defer`, 8 rejected. Decision resolved → option **3** (hybrid).

- [x] [Review][Decision] Visible stop reason vs download-only — resolved 2026-10-22: option **3** hybrid (cancel unlock +「已取消」; completion stays silent download; delete dead `finishWithArticles`/`stopReasonMessage`; leave CS `walkListPages` as unit-tested helper, not live path).

- [x] [Review][Patch] Cancel unlock +「已取消」; clear busy/cancelTabId after `requestCancel` [`extension/src/popup.ts:347`]
- [x] [Review][Patch] Delete dead `finishWithArticles` / `stopReasonMessage`; drop tests that pin them [`extension/src/popup.ts:192`]
- [x] [Review][Patch] `waitTabNavigateComplete` hangs if `complete` arrives without prior `loading` [`extension/src/background.ts:30`]
- [x] [Review][Patch] SW loop: `tabs.update` uncaught + no in-flight mutex [`extension/src/background.ts:101`]
- [x] [Review][Patch] Executable tests for SW driver / cancel flag / `EXTRACT_PAGE_META` / opt-in branch [`extension/test/pagination.test.mjs`]

- [x] [Review][Defer] Pager `totalPagesFromPagerText` may underestimate when WeUI omits last page numeral [`extension/src/logic.ts:90`] — deferred: maybe-false medium; settle with HITL/screenshot of ellipsis pager where last page is not in DOM
- [x] [Review][Defer] Large multi-page `data:` download may hit browser URL size limits [`extension/src/background.ts:20`] — deferred: maybe-false medium; settle by exporting near MULTI_PAGE_CAP and checking `chrome.downloads.download` reject

**Rejected**
- Progress bar `markProgressComplete` right after SW start — low cosmetic; popup often closed.
- Help text omits that SW rewrites list tab URL — low; everyday path closes popup.
- `tabExportContext`「请先登录本号列表」on non-list mp — false; 6.1 Design Notes map home/etc. to not-ready/login equivalent by design.
- `meta.articles` non-array throws — low; content always sends array.
- `begin`/`count` NaN nextUrl — low; WeChat list URLs supply them.
- `findNextPageControl` falling back to 上一页 — false for live product (CS walk unused).
- Title-only dedupe drops distinct rows without url — maybe-false would be low.
- No tab-change status refresh — false; CAP-1 delivered open-time reading.

### 2026-10-22 (re-review)
**Code review complete.** 0 `decision-needed`, 5 `patch`, 1 `defer`, 7 rejected. Decision resolved → option **3**.

- [x] [Review][Decision] Cancel unlock vs SW still walking — resolved 2026-10-22: option **3** — show「已取消」but block re-export until `multiInFlight` clears (poll/message); also require cancel ack before claiming cancelled.

- [x] [Review][Patch] After cancel:「已取消」+ block export until SW idle; require cancel ack [`extension/src/popup.ts:301`]
- [x] [Review][Patch] Clear `multiCancelled` before `sendResponse(started)` so cancel between ack and `runMultiExport` is not wiped [`extension/src/background.ts:77`]
- [x] [Review][Patch] `waitTabNavigateComplete`: after attach, resolve if tab already `complete` [`extension/src/background.ts:30`]
- [x] [Review][Patch] Wrap `downloadJson` in try/catch inside `runMultiExport` [`extension/src/background.ts:96`]
- [x] [Review][Patch] Executable tests: navigate/wait reject in `runUrlMultiExportLoop`; start-gate busy helper; waitTab complete-without-loading [`extension/test/pagination.test.mjs`]

- [x] [Review][Defer] `waitTabNavigateComplete` may resolve on stray `complete` (user navigates other URL) [`extension/src/background.ts:43`] — deferred: maybe-false medium; settle by HITL navigating away mid-export or asserting URL match after complete

**Rejected**
- Cancel still downloads partial rows — false; Design Notes + hybrid option 3 require partial download when rows exist.
- Lost「已到末页」/ empty-cancel paste CTA — false; hybrid option 3 intentionally removed popup completion reasons.
- Plan/triage prose vs silent completion — reject; fix would only edit the plan under review.
- Generic「未能启动」for SW `busy` — low; concurrent start rare.
- Claims file HEAD epic-6 sweep narrative vs patch diff — false; claims staging includes prior commit message by design.
- Intent CS-click / visible end reason vs SW hybrid — false for this re-review; prior decision option 3 stands.
- Source-only `onCancel`/`popupExportKind` sniff alone — absorbed into patch test item where executable; remaining literal checks are low and not worth extra harness complexity beyond the patch list.
