---
title: 'Extension list metrics enrichment'
type: 'feature'
ticket: '1'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
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

**Problem:** Live list export often yields only `title` + `url` with all counts in `_missing` (dogfood 2026-10-20 smoke). Fixtures already map `read_num` → `read_count`, but real `app_msg_list` / `publish_list` payloads frequently omit metrics while the publish-list UI still shows numbers — and extract returns embedded rows early without merging DOM.

**Approach:** Enrich list-page extract on the same hosts only: (1) broaden nested JSON field aliases when metrics exist; (2) always also collect DOM/visible-row metrics; (3) merge by normalized title so JSON titles/urls keep counts from the page when JSON lacks them; (4) still omit + `_missing` when neither source has the count. No new permissions/hosts; no per-article navigation; no `webRequest` sniffing.

## Boundaries & Constraints

**Always:**
- Manifest freeze unchanged: `permissions` downloads/tabs; `host_permissions` only `https://mp.weixin.qq.com/*`.
- Current list page only; `body` always omitted + in `_missing`.
- Counts are numbers when present; absent keys listed in `_missing`.
- Privacy-lock tests must still pass.

**Never:**
- No new hosts, optional_permissions, or network APIs beyond the open tab’s DOM/scripts.
- No opening article pages / `getappmsgext` / content-analysis APIs.
- No Skill code in the extension; no auto-pagination (still deferred).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| JSON has read_num | Embedded app_msg_list with read_num | numeric read_count; body in _missing | Existing normalize |
| JSON title/url only | Real smoke shape: title+link, no counts | After merge: fill counts from DOM if visible; else _missing includes read_count | No invent numbers |
| DOM attrs only | No embedded JSON; data-read-count rows | Counts from attrs | Same as today |
| Title mismatch | JSON title ≠ DOM text slightly | Prefer exact normalized match; no fuzzy invent | Leave count _missing |
| Empty page | No rows | Empty → paste CTA (unchanged) | No download |

</frozen-after-approval>

## Code Map

- `extension/src/content-list.ts` — `mapRawFields`, `articlesFromEmbeddedPayload`, `extractFromDomRows`, `extractArticlesFromDocument` (early-return bug: embedded wins with zero counts). Add merge + richer aliases / DOM metric harvest.
- `extension/src/logic.ts` — `normalizeArticles` / `_missing` (reuse; do not widen gold keys).
- `extension/test/content-list.mjs` — built twin of content-list; rebuild via existing npm script.
- `extension/test/extract.test.mjs` — add merge + title-only JSON cases.
- `extension/fixtures/list-page.html` — keep rich JSON fixture; add `list-page-metrics-dom.html` (or sibling) with title/url JSON + DOM counts.
- `extension/test/privacy-lock.test.mjs` — must remain green; do not touch freeze arrays.
- Evidence: `~/Downloads/articles.interchange (1).json` — title/url only; `dogfood/2026-10-20/extension-smoke.md`.

## Tasks & Acceptance

**Execution:**
- [x] `extension/src/content-list.ts` — merge embedded + DOM metrics by title; broaden count aliases / DOM harvest — fix live smoke gap
- [x] `extension/fixtures/` + `extension/test/extract.test.mjs` — fixture for JSON-without-counts + DOM counts; assert merge — I/O matrix
- [x] `extension` build/tests — rebuild content-list.mjs; `npm test` including privacy-lock — regression

**Acceptance Criteria:**
- [x] Given embedded JSON with titles but no counts and DOM showing counts for those titles, when extract runs, then exported articles have numeric `read_count` (and other counts when DOM provides them).
- [x] Given neither JSON nor DOM has a count, when normalize runs, then that key is absent and listed in `_missing`.
- [x] Given privacy-lock suite, when tests run, then freeze assertions still pass.
- [x] Given HITL (or dated smoke ≤7 days), when maintainer exports from logged-in list, then result matches the above or documents remaining `_missing` honestly.

## Implementation Notes

- 2026-10-20 HITL: live export has numeric counts + absolute publish_time; only `body` in `_missing`. See dogfood/2026-10-20/extension-smoke.md.

- 2026-10-20: Fixed early-return so extract always merges embedded title/url with DOM counts via `normalizeTitleForMatch`. Broadened aliases incl. nested `appmsg_stat` / `stat`. Added `data-*` merge fixture + `metricsFromRowText` for plain integer rows (`list-page-metrics-text.html`). `npm test`: 24 pass (incl. privacy-lock). Manifest freeze unchanged. (Mid-pass note of pending HITL superseded by same-day live re-export above.)
- 2026-10-20 review patches: `metricsFromRowText` prefers mostly-int lines / last 2+ int run, skips years & month-day; title cut uses normalized-span→raw map; drop `comment_num`→wow; HTML DOM rows match `data-title` with `mp-msg-item`/`data-gzh-row` in any attr order.

## Plan Change Log

## Review Triage Log

- medium, patch — metricsFromRowText ate date ints → prefer metric lines / skip year-month tokens.
- medium, patch — title strip whitespace mismatch → cut via normalized span mapped to raw.
- low, patch — comment_num mapped to wow_count → removed.
- low, patch — HTML attrRe required class before data-title → order-independent match.
- HITL live re-export: completed same day (`dogfood/2026-10-20/extension-smoke.md` · 5.1 通过); no longer deferred.

## Design Notes

Prefer **merge** over “DOM-only fallback”: live smoke proves JSON is useful for title/url but incomplete for metrics. Normalize titles (trim, collapse whitespace, strip trailing “原创”) before match. Harvest DOM via existing `data-*` attrs first; optionally parse publish-list row text for leading integers next to titles without requiring new hosts. Do not scrape unrelated page chrome numbers into articles.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: extract + privacy-lock pass, including new merge case
- `python3 -c "import json; m=json.load(open('extension/manifest.json')); assert m['permissions']==['downloads','tabs','scripting']; assert m['host_permissions']==['https://mp.weixin.qq.com/*']"` -- expected: exit 0

**Manual checks (if no CLI):**
- HITL: logged-in `appmsg`/`appmsgpublish` list → 导出; spot-check that UI-visible reads become `read_count` or stay in `_missing` with a short note under `dogfood/` if still absent.
