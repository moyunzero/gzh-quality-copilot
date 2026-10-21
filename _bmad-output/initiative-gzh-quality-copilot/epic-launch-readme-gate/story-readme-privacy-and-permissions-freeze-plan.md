---
title: 'README privacy and permissions freeze'
type: 'feature'
ticket: '2'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'full'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** README「权限清单 + 三层隐私」仍是占位；陌生人无法对照清单核对扩展权限，也容易误以为「本地导出 = 数据永不离机」。

**Approach:** 用 `extension/manifest.json` 的 `permissions` 与 `host_permissions` 原文填进 README 权限清单；用白话写清三层隐私（本地导出；作者 Agent 上的 Skills；粘贴内容发往作者自选模型 API），对齐 Customer FAQ Q5 / AD-7。不改安装矩阵、禁令、演示等其它节。

## Boundaries & Constraints

**Always:**
- `permissions` 与 `host_permissions` 数组内容与 `extension/manifest.json` 字节级一致（顺序、字符串相同）：`["downloads","tabs"]` 与 `["https://mp.weixin.qq.com/*"]`。
- 三层均须明文出现：① 扩展本地导出；② Skills 跑在作者自己的 Agent；③ 贴进对话的内容会发给作者选用的模型 API（唯一会离开本机的环节）。
- 中文、面向非技术读者；可顺带一句「不必读代码即可对照清单」。

**Never:**
- 不改 `extension/` 源码或测试（3.3 已冻结源）。
- 不重写 安装 / 预期对齐 / 禁令 / 演示 / 扩展失败→粘贴 / License（4.1 / 4.3+）。
- 不发明额外 host、optional_permissions，或暗示本项目有云端账号/代持登录。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Verbatim freeze | Current manifest arrays | README lists exactly those two arrays | Drift = defect; fix README not invent permissions |
| Three-layer honesty | Reader after local export | Sees that paste→API leaves the machine | Must not imply export-only forever-local |
| Non-tech skim | FAQ Q5 reader | Plain Chinese bullets; checklist readable without opening code | No jargon-only wall |

</frozen-after-approval>

## Code Map

- `README.md` L50–52 — replace「权限清单 + 三层隐私」占位 only; leave neighbors alone.
- `extension/manifest.json` L10–11 — sole source: `permissions`, `host_permissions`.
- `extension/popup.html` 会做/不会做 — tone reference only; do not mirror CSS/HTML into README.
- `extension/test/privacy-lock.test.mjs` — freeze already asserted in extension; README must match same values (no new test required unless easy one-liner verify).
- `_bmad-output/.../prfaq-.../prfaq-gzh-quality-copilot.md` Q5 — wording source for three layers.
- `_bmad-output/.../architecture-.../architecture-gzh-quality-copilot.md` AD-7 — product-surface rule.
- Prior plan `story-readme-install-matrix-plan.md` — left this section untouched on purpose.

## Tasks & Acceptance

**Execution:**
- [x] `README.md` — replace 权限清单 + 三层隐私 placeholder with verbatim permission/host lists + three-layer Chinese body from Q5/AD-7 — FR-2 / AD-7 launch surface

**Acceptance Criteria:**
- Given current `manifest.json`, when README is checked, then `permissions` and `host_permissions` strings match exactly (empty diff of those two arrays).
- Given a non-technical reader, when they read that section, then all three privacy layers are stated in plain Chinese.
- Given other README sections, when this ticket lands, then 安装 / 禁令占位 / 演示 remain as before this edit.

## Implementation Notes

- 2026-10-20: Replaced README「权限清单 + 三层隐私」placeholder only. Arrays copied verbatim from `extension/manifest.json`: `["downloads","tabs"]`, `["https://mp.weixin.qq.com/*"]`. Three layers from Q5/AD-7 (local export / Skills on author Agent / paste→author-chosen model API). Neighbors (安装 / 禁令 / 演示 / 扩展失败 / License) untouched. Verified via plan python assert + rg.

## Plan Change Log

## Review Triage Log

- quick (2026-10-20): no findings.

## Design Notes

Keep the section short: a labeled checklist (two arrays as code or inline `` `...` ``) plus three numbered layers. Prefer Q5’s honesty line: 「导出在本地」≠「贴进对话后仍不出电脑」. Optional one-liner that popup「会做」已经同源冻结，避免 README 与 popup 双源漂移——但清单仍以 manifest 为准。

## Verification

**Commands:**
- `python3 -c "import json,re,pathlib; m=json.load(open('extension/manifest.json')); t=pathlib.Path('README.md').read_text(); assert all(p in t for p in m['permissions']); assert all(h in t for h in m['host_permissions']); assert '占位：须与' not in t"` -- expected: exit 0
- `rg -n '三层|本地|Skills|模型|permissions|host_permissions|downloads|tabs|mp\.weixin\.qq\.com' README.md` -- expected: three layers + freeze strings present; no 权限占位

**Manual checks (if no CLI):**
- Diff README-listed arrays against `extension/manifest.json` by eye; both must match.
