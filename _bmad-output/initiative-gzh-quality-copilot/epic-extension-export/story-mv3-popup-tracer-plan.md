---
title: 'MV3 popup tracer'
type: 'feature'
ticket: '1'
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
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has an empty `extension/` folder; there is no MV3 popup that can download gold-shaped JSON or fail into paste.

**Approach:** Ship a TypeScript MV3 popup (~360px, Proof Desk tokens). **导出** off the MP list page shows one-line error + 改用粘贴 and does not download. A **夹具导出** control always downloads local JSON matching gold `articles[]` keys and number types. No live MP scrape.

## Boundaries & Constraints

**Always:** Manifest V3; popup not Side Panel; local download only; gold keys `title`, `publish_time`, `read_count`, `like_count`, `share_count`, `wow_count`, `url`, `body`; counts are JSON numbers; keyboard-focusable CTAs; `prefers-reduced-motion: reduce` disables motion.

**Never:** content-script scrape of WeChat DOM (3.2); CSV export; proxy-login, publish, other-account, upload; Skill logic inside the extension.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Off list page | Active tab is not MP appmsg list | 导出 shows error + 改用粘贴; no file | Message in `{colors.danger}` |
| Fixture download | Person clicks 夹具导出 | Downloads JSON `{ articles: [...] }` with gold keys | `downloads` API failure → same paste CTA |
| Reduced motion | OS prefers-reduced-motion | State changes with no 200ms fade / height animate | Instant |

</frozen-after-approval>

## Code Map

- `extension/.gitkeep` -- keep; add real files beside it
- `examples/articles.interchange.json` -- gold shape to copy for fixture payload (do not import Skills)
- `ux-gzh-quality-copilot/DESIGN.md` -- paper/ink/accent, Fraunces + Plex, popup 360px, motion table

## Tasks & Acceptance

**Execution:**
- [x] `extension/manifest.json` -- MV3, `action.default_popup`, permissions `downloads` + `tabs` (tab URL check only)
- [x] `extension/popup.html` + `extension/popup.css` + `extension/src/popup.ts` -- Proof Desk popup; 导出 / 夹具导出 / 会做/不会做 `<details>`
- [x] `extension/package.json` + `extension/tsconfig.json` -- esbuild `src/popup.ts` → `popup.js`
- [x] `extension/fixtures/tracer.json` -- gold-shaped sample used by 夹具导出

**Acceptance Criteria:**
- Given unpacked load, when the active tab is not an MP list URL, then 导出 shows 改用粘贴 and does not call downloads.
- Given unpacked load, when 夹具导出 is used, then a JSON file downloads whose `articles` items include gold field names and numeric counts.
- Given a keyboard-only user, when Tab is pressed, then 导出 and 夹具导出 receive focus.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- medium, patch — `popup.css` reduce query `.status` (0,1,0) loses to `.status.is-in` 200ms fade; details still fade under reduced motion. Raise matching selectors inside the media query.
- high, patch — `onFixtureExport` revokes the blob URL as soon as `downloads.download` returns, so Chrome can fail the fetch while UI shows success. Use a durable URL or revoke after the item finishes.
- low, patch — progress bar is mid-body 200ms fake scaleX, no 底边 / 勾选 / 300ms complete. Match DESIGN motion table with the smallest CSS/TS.
- low, patch — 会做/不会做 only fades opacity; DESIGN wants height+opacity 180ms.

## Design Notes

Proof Desk already locked: cool gray paper `#EEF1F5`, ink `#12141A`, accent `#C45C26`, no purple gradient, hairline shadow only. List-page URL for 3.1: `mp.weixin.qq.com` pathname containing `appmsg`; everything else is off-list.

## Verification

**Commands:**
- `test -f extension/manifest.json && python3 -c "import json; m=json.load(open('extension/manifest.json')); assert m['manifest_version']==3"` -- expected: exit 0
- `cd extension && npm run build` -- expected: popup.js emitted
- `python3 -c "import json; d=json.load(open('extension/fixtures/tracer.json')); assert all(k in d['articles'][0] for k in ('title','read_count'))"` -- expected: gold keys

**Manual checks (if no CLI):**
- Chrome → 加载已解压的扩展程序 → 非 MP 列表页点导出见粘贴 CTA；点夹具导出得到 JSON 文件。
