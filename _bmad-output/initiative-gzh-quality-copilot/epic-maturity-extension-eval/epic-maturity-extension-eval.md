---
tracker_id: ""
key: ""
type: epic
title: "Maturity: login status, opt-in multi-page export, thickened eval"
parent: initiative-gzh-quality-copilot
covers: [CAP-1, CAP-2, CAP-3]
after: []
assignee: ""
risk: high
---

# Maturity: login status, opt-in multi-page export, thickened eval

## Description

关闭 MVP 后延期项：导出前可见「是否已登录本号列表」；勾选后才翻全号列表并可取消；用合成夹具加厚 eval 中/高档与重跑约定。规格见 `spec-maturity-post-mvp`。

## Outcome

作者打开扩展即知能否导出；可选完整列表导出且可中止；陌生人能按中/高档夹具复跑 Skill vs 裸聊而不发明语料。信号即规格 Success signal。

## Requirements

- CAP-1: 导出前可读登录/列表上下文状态（EXPERIENCE：状态 → 导出）。
- CAP-2: 仅勾选时翻全号；中途取消必做；未勾选仍为当前页导出。
- CAP-3: 合成 mid(10–29)/high(≥30) 夹具 + 改 Skill 后重跑流程 + 可选报告自检清单；不改 contracts 档位与 rubric 维。

## Done when

1. 非列表 / 列表页上，不点导出也能在弹窗读到状态文案。
2. 未勾选 = 仅当前页；勾选可翻多页；取消能停且有可见结果/原因；多页号勾选完成时篇数 > 仅首页。
3. `dogfood/eval/` 有 mid+high 合成夹具与 README 重跑/自检说明；contracts 档位数字未改。
4. 本 epic 写入 deferred 的对应 open 行已关闭或改写为 done 证据。

## Boundaries

扩展 popup + 列表抽取翻页；eval 文档与合成夹具。不碰百度/SEO、不改推荐禁令、不改 band 阈值、不进 `dogfood/private/`。

Touch point: mp 列表 DOM / 翻页控件 — owner: entries 1–2。  
Touch point: eval harness 文档 — owner: entry 3。

## References

- parent — `_bmad-output/initiative-gzh-quality-copilot/initiative-gzh-quality-copilot.md`
- spec — `../spec-maturity-post-mvp/spec-maturity-post-mvp.md` (CAP-1..3)
- ux — `../ux-gzh-quality-copilot/EXPERIENCE.md`（扩展 IA 行）
- deferred — `../deferred-work.md`
- constraint — privacy freeze / manifest enumerable（epic-extension-export + README）

## Notes

- Decision: 2026-10-21 — 勾选才翻全号 + 要取消；合成夹具不进 private；顺序 登录态 → 翻页 → eval。
- Decision: 2026-10-21 — 单 epic 覆盖 CAP-1..3（同维护者；扩展两票同模块；eval 按用户顺序殿后）。
- Tracer: entry 1 Pre-export login/list status.
- Unknown: 微信列表「下一页」控件选择器随改版漂移；entry 2 以 HITL/夹具双轨：自动化测分页状态机，真页 HITL 冒烟记证据。
- Waits on epic-extension-export / epic-quality-depth because: MV3 列表抽取与现有 eval 骨架已在。
