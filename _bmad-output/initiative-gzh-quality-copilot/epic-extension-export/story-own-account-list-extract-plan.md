---
title: 'Own-account list extract'
type: 'feature'
ticket: '2'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'full'
route_source: 'pinned'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/initiative-gzh-quality-copilot/ux-gzh-quality-copilot/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-gzh-quality-copilot/ux-gzh-quality-copilot/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On the MP list page, 导出 only recognizes the URL and still asks for 夹具导出; there is no content-script path that writes a real local JSON of own published rows.

**Approach:** On `mp.weixin.qq.com` list URLs, 导出 injects/uses a content script on the active tab only, reads the current list page (no article-detail navigation, no body text), normalizes rows to gold keys with omit + `_missing`, downloads JSON locally, shows progress/`aria-busy` and the saved filename on success.

## Boundaries & Constraints

**Always:** Manifest V3; `host_permissions` only for `https://mp.weixin.qq.com/*`; current list page only (no auto-pagination); `body` always omitted and listed in `_missing`; missing other gold keys omitted + named in `_missing`; counts are numbers when present; block double-click while running; success shows local filename; failure → 改用粘贴; 夹具导出 from 3.1 remains.

**Never:** Open article pages; scrape body; extra hosts; CSV; proxy-login / publish / other-account / upload; Skill logic in the extension.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Off list | Active tab not MP appmsg list | Same as 3.1: danger + 改用粘贴; no download | `{colors.danger}` |
| List extract OK | Logged-in list page; rows parseable | Downloads `{ articles: [...] }`; each row gold keys or `_missing`; no detail nav | Progress + `aria-busy` on 导出 |
| Empty / unparseable | List URL but 0 rows extracted | No download; danger + 改用粘贴 | Message naming empty list |
| Double-click | 导出 while running | Second click ignored | Button disabled + `aria-busy` |
| Always-missing body | Any successful row | No `body` key; `_missing` includes `"body"` | N/A |

</frozen-after-approval>

## Code Map

- `extension/manifest.json` -- add `host_permissions` + `content_scripts` for mp list; keep `downloads`/`tabs`
- `extension/src/popup.ts` -- replace on-list stub with sendMessage extract → download; progress/`aria-busy`; keep 夹具导出
- `extension/src/logic.ts` -- add `normalizeArticle` / omit+`_missing` (do not force all keys like fixture assert)
- `extension/src/content-list.ts` (new) -- list-page scrape; provisional selectors; return raw field bag; no navigation
- `extension/popup.html` -- update 会做/不会做 copy to match list extract
- `extension/package.json` -- esbuild content script + popup
- `extension/fixtures/list-page.html` (new) -- offline DOM fixture for extractor unit tests
- `extension/test/*.mjs` -- cover matrix: off-list, normalize `_missing`/body, empty extract, double-busy guard via source or pure helpers
- `examples/articles.interchange.json` -- gold key names only; do not require full keys on live rows
- 3.1 plan Code Map -- reuse Proof Desk UI, `isMpListUrl`, `FIXTURE_FILENAME`, data-URL download pattern

## Tasks & Acceptance

**Execution:**
- [x] `extension/manifest.json` -- `host_permissions: ["https://mp.weixin.qq.com/*"]` + content_scripts match appmsg list; build emits `content-list.js`
- [x] `extension/src/content-list.ts` -- extract current-page rows; never `location.assign` / open detail; message reply `{ articles: RawRow[] }` or error
- [x] `extension/src/logic.ts` -- `normalizeArticles`: omit absent gold keys; always put `body` in `_missing`; counts as numbers when parseable
- [x] `extension/src/popup.ts` -- on-list 导出: busy lock, message content script, download JSON, success filename in `{colors.signal-ok}`; empty/error → paste CTA
- [x] `extension/popup.html` -- 会做 includes list scrape; 不会做 still bans body/detail/csv/upload
- [x] `extension/fixtures/list-page.html` + tests -- unit-test extract + normalize matrix rows without WeChat

**Acceptance Criteria:**
- Given unpacked load on a non-list tab, when 导出 is clicked, then paste CTA and no download (3.1 behavior preserved).
- Given a list-page DOM fixture with two title rows and no body, when normalize+extract runs, then JSON has two articles, each with `_missing` containing `body`, and no `body` key.
- Given extract returns zero articles, when 导出 finishes, then no file is downloaded and 改用粘贴 is shown.
- Given 导出 is in progress, when it is clicked again, then a second extract does not start.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- medium, patch — `onExport`/`onFixtureExport` set busy only after `await activeTab()`; double-click can start a second extract. Set busy immediately after the `exportRunning` guard.
- medium, patch — `isMpListUrl` is broader than `content_scripts.matches`, so some tabs look like list pages but have no script → misleading empty-list paste. Align URL check with inject matches.
- medium, patch — embedded-script regex stops at the first `]`, so nested `app_msg_list` JSON often fails parse. Use bracket-balanced slice (or equivalent) before `JSON.parse`.
- low, reject — EXPERIENCE asks for text % progress; intent only requires progress + `aria-busy`, and the ink bar already conveys progress. Skip extra UI.
- defer — EXPERIENCE wants pre-export「已登录本号？」status; 3.1/3.2 never shipped it; not caused by this extract change.

## Design Notes

Provisional list selectors are epic maintenance debt (no in-repo WeChat DOM docs). Prefer reading visible list rows / embedded list JSON on the page when present; if both fail → empty → paste. Do not invent multi-host permissions. HITL: real logged-in export; if unavailable this week, a dated smoke note within 7 days substitutes (ticket verify).

Example normalized row:

```json
{
  "title": "示例标题",
  "publish_time": "2025-03-12",
  "read_count": 100,
  "_missing": ["like_count", "share_count", "wow_count", "url", "body"]
}
```

## Verification

**Commands:**
- `cd extension && npm run build && npm test` -- expected: build emits popup.js + content-list.js; tests pass
- `python3 -c "import json; m=json.load(open('extension/manifest.json')); assert 'https://mp.weixin.qq.com/*' in m.get('host_permissions',[])"` -- expected: exit 0

**Manual checks (if no CLI):**
- Chrome unpack → logged-in MP 已发表列表 → 导出 → local JSON; rows use gold keys or `_missing`; no article tab opens. Else: smoke note dated within 7 days.
