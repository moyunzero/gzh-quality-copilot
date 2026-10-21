---
title: 'Pre-export login/list status'
type: 'feature'
ticket: '1'
created: '2026-10-21'
status: done
baseline_revision: '950d75c4ec12ab4bdf14ac094779bb6d6a894e1b'
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

**Problem:** Popup only reveals list/login context after clicking 导出; EXPERIENCE wants 状态 → 导出, and CAP-1 requires readable status without that click.

**Approach:** On popup open (and when the active tab may have changed), classify the active tab with the same list-URL gate export already uses, show a status line (ok / not-list / not-logged-in-or-equivalent), and leave export behavior unchanged.

## Boundaries & Constraints

**Always:** Own-account privacy freeze; permissions stay downloads/tabs/scripting + mp.weixin.qq.com; reuse `isMpListUrl` / export off-list wording where possible; status must appear without clicking 导出.

**Never:** New hosts; auto-pagination (6.2); scraping other accounts; redesigning the whole popup; changing contracts/eval; requiring a successful extract to show “ready”.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| List URL | Active tab `mp.weixin.qq.com` `/cgi-bin/appmsg*` or `appmsgpublish*` | Status ok/note: ready to export (copy aligns with「本号已发表列表」) | No error |
| Off-list | Other URL or missing tabs API | Status danger/note: not published-list page; paste CTA may show | Same family as export off-list |
| Login-like / not usable | mp URL that is clearly login or non-list home (e.g. home, login paths — not appmsg list) | Status danger/note: not ready / 请先登录本号列表 (equivalent to not-logged-in) | No extract |
| Tabs API throw | `chrome.tabs.query` fails | Same as off-list readable status | No throw to user |

</frozen-after-approval>

## Code Map

- `extension/src/logic.ts` — `isMpListUrl`, `exportIsOffList`; add a small pure classifier (e.g. `tabExportContext(url)`) returning enum/labels for tests; do not change normalize/extract.
- `extension/src/popup.ts` — `showStatus` exists but only after export; add `refreshContextStatus()` on load; do not change download/extract success paths beyond sharing copy helpers if needed.
- `extension/popup.html` — `#status` already present; optional always-visible context slot above actions if needed for layout (prefer reuse `#status`).
- `extension/popup.css` — reuse `.status.is-ok/.is-danger/.is-note`; minimal tweak if pre-export status should not fight post-export messages.
- `extension/test/tracer.test.mjs` + logic tests — assert classifier + that popup source calls refresh without export click; keep existing off-list export tests green.
- `extension/src/content-list.ts` — **do not change** in 6.1 (no probe required for CAP-1).
- Spec/UX — `spec-maturity-post-mvp` CAP-1; EXPERIENCE IA row 状态→导出.

## Tasks & Acceptance

**Execution:**
- [x] `extension/src/logic.ts` -- Add pure `tabExportContext(url)` (or equivalent) mapping URL → ready | not-list | not-ready (login/home equivalent); unit-testable; keep `isMpListUrl` behavior for export gate.
- [x] `extension/src/popup.ts` -- On popup script load, query active tab and `showStatus` from classifier; keep `onExport` gate logic consistent with classifier.
- [x] `extension/popup.html` / `popup.css` -- Only if needed so pre-export status is visible without relying on a click; prefer existing `#status`.
- [x] `extension/test/*.mjs` -- Cover classifier matrix + assert popup refreshes status without export; rebuild popup.js via existing package script.
- [x] HITL note -- Maintainer opens popup on list vs non-list tab once; optional one-liner under dogfood or plan Implementation Notes.

**Acceptance Criteria:**
- Given a published-list tab, when popup opens without clicking 导出, then status text indicates ready/list context.
- Given a non-list tab, when popup opens, then distinct not-list (or not-ready) status appears without 导出.
- Given existing export flows, when user exports or uses fixture, then behavior and privacy-lock tests still pass.

## Implementation Notes

- HITL: Maintainer open popup once on appmsg list tab vs non-list tab; confirm distinct status without clicking 导出.

## Plan Change Log

## Review Triage Log

- 2026-10-21 quick — findings: 0 (No findings). verdicts high/medium/low/false/maybe-false: 0/0/0/0/0. No patch/defer/intent_gap/bad_plan.

## Design Notes

Infer “已登录本号” from being on the same appmsg list paths export already trusts—no content-script probe in 6.1. Non-list mp paths (home, etc.) map to not-ready/not-logged-in **equivalent**. Exact Chinese strings may match existing「当前不是已发表列表页。」plus a positive ready line for list URLs.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: all tests pass
- `cd extension && npm run build` (or project’s existing build script) -- expected: popup.js/content-list.js updated if sourced from TS

**Manual checks (if no CLI):**
- Load unpacked extension; open popup on `appmsg` list tab vs `example.com`; confirm distinct status without clicking 导出.
