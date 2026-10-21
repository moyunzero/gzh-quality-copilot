---
title: 'README bans and paste fallback'
type: 'feature'
ticket: '3'
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

**Problem:** README「禁令」与「扩展失败 → 粘贴」仍是占位；陌生人看不到可测的合规禁令，也不知道扩展挂了以后还能不能用同一数据形状继续复盘。

**Approach:** Replace both placeholders with plain Chinese: ban sentences covering 推流破解 / 保证推荐 / 未授权批量采他号 (FR-14 literals or clear synonyms); and a permanent paste-fallback section that points at the same interchange shape as 演示 (`examples/articles.interchange.json` / CSV). Leave 安装 / 权限 / 演示 / License untouched.

</frozen-after-approval>

## Implementation Notes

Oneshot: ~two README sections, docs-only; risk stays ticket `low`.
- Replaced 禁令 with three bullets (推流破解、保证推荐、未授权采他号).
- Replaced 扩展失败→粘贴 with permanent paste-fallback pointing at same interchange examples as 演示.
- Left 安装 / 权限 / 演示 / License untouched.

## Plan Change Log

## Review Triage Log

- quick (2026-10-20): no findings.

## Verification

**Commands:**
- `rg -n '占位：禁止|占位：首发|推流|保证推荐|未授权|粘贴|articles\.interchange' README.md` -- expected: no 禁令/粘贴 placeholders; ban + paste-fallback + interchange pointers present
- `rg -n 'permissions|downloads|tabs|有历史篇数' README.md` -- expected: prior 4.1/4.2 sections still present

**Manual checks (if no CLI):**
- 禁令 names all three ban themes; 扩展失败→粘贴 says paste is permanent after launch and same interchange shape.
