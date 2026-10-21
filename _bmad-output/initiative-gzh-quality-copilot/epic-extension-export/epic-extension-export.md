---
type: epic
title: "Extension own-account export"
parent: initiative-gzh-quality-copilot
covers: [FR-5, FR-2]
after: []
assignee: ""
risk: high
status: done
---

# Extension own-account export

## Description

Chrome MV3 扩展：在作者已登录的公众号后台导出本号已发表数据为本地 JSON（对齐金样）；权限最小化且可列清单。

## Outcome

首发可用扩展能导出至少一份本号数据（或当周冒烟记录），且不越权、不上传本项目服务器。

## Done when

1. `extension/manifest.json` 为 Manifest V3；popup 可触发导出。  
2. 导出 JSON 字段与 `examples/articles.interchange.json` 一致（或缺字段显式标注）。  
3. 不实现代持登录、代发、他号读取、上传本项目服务器。  
4. 失败时 UI/文案指向粘贴路径。  
5. host/permissions 可被 README 原样引用（供 epic4）。

## Requirements

- FR-5: MV3 本号已发表列表 → 本地 JSON（形同金样）；缺字段用省略键 + `_missing`；失败 → 改用粘贴。本 epic 不做 CSV。  
- FR-2（本 epic）：`manifest.json` 的 host/permissions 是 README 将原文抄写的源；popup 会做/不会做与行为一致。三层隐私正文留给 epic-launch-readme-gate。

## Boundaries

仅扩展 ingress。不含 Skills 诊断逻辑；不进文章页抓正文；DOM 选择器属本 epic 维护债。

## References

- architecture — architecture-gzh-quality-copilot.md AD-2, AD-3, AD-6, AD-7  
- prd — prd-gzh-quality-copilot.md FR-5, FR-2  
- ux — DESIGN.md popup Motion；EXPERIENCE.md 扩展状态  
- foundation — examples/articles.interchange.json  

## Notes

- Waits on epic-foundation-scaffold because: interchange gold sample.  
- Assumption: 实现语言 TypeScript；UI = popup（非 Side Panel）。  
- Decision: 2026-10-20 — 用户确认默认：示踪弹用扩展内夹具/stub 下载 JSON（不必开微信）；票 2 只刮列表、`body` 进 `_missing`；缺字段 = 省略键 + `_missing`；票 2 hitl 真账号导出（做不到则当周冒烟记录）。  
- Decision: 2026-10-20 — 本 epic 不做 CSV。  
- Decision: 2026-10-20 — tracer = 3.1；最不确定 = 3.2 真 DOM；1→2→3 因共用 `extension/` 与 manifest，不是为了排队。  
- High-risk checks: 3.1 人 unpack 加载；3.2 人在已登录 MP 列表点导出。  
