---
tracker_id: ""
key: ""
type: epic
title: "Quality depth after launch gates"
parent: initiative-gzh-quality-copilot
covers: [FR-5, FR-6, FR-8, FR-11, FR-12]
after: []
assignee: ""
risk: high
status: done
---

# Quality depth after launch gates

## Description

在首轮 README/门闩落地之后，加深「真数据 → 真诊断 → 真能发 → 可复现评测」：扩展尽量带齐列表页可读指标；Skill 因子不重复且引用 `references/`，实验块可粘贴开写；Skill vs 裸聊用固定样本与打分表验收，而不靠感觉。

## Outcome

维护者/作者用本号数据时，感觉诊断更有信息量、下一篇实验可执行；对照评测可复跑；扩展少依赖手工台账粘贴阅读数。

## Requirements

- FR-5（本 epic 加深）：列表页导出尽量填充 `read_count`（及页面上能稳定拿到的其它 count）；拿不到的键进 `_missing`；不新开 host。  
- FR-6 / FR-11 / FR-12：同份 ≥10 样本复跑时，因子 ≥2 条且套路不重复；重要判断带依据或 `【推测】`；四块骨架保留。  
- FR-8：因子/结论须能点到 `references/sf-*`（至少一条实质引用，非仅挂名）。  
- SM-2（评测固化）：仓库内固定样本 + 打分表，Skill vs 裸聊可按表复现（降级 / 依据 / 四块 / 可发实验）。

## Done when

1. HITL 或当周冒烟：已登录本号列表导出 JSON 中，页面上可见的阅读等 count 进入字段或明确 `_missing`。  
2. 同份 ≥10 本号（或夹具）样本：Skill 输出因子不重复堆「物件+异常」一条套路，并引用至少一条 `references/sf-*`。  
3. 「04 实验」含可粘贴标题 + 开头约 150 字写法说明 + 单变量约束。  
4. `examples/` 或 `dogfood/eval/` 存在固定评测样本与打分表；按表可复跑 Skill vs 裸聊。

## Boundaries

扩展抽取加深 + Skill/契约 + 评测文档。不承诺推荐/涨粉；不做自动翻页全号；不改 LICENSE/README 安装矩阵（除非评测指针一行）。

Touch point: 微信公众号后台列表 DOM — owner: 本 epic entry 1。  
Touch point: 作者 Agent / 模型 — owner: 本 epic entry 2–3（本仓只交 Skill 与评测）。

## References

- parent — `_bmad-output/initiative-gzh-quality-copilot/initiative-gzh-quality-copilot.md`
- prd — `prd-gzh-quality-copilot/prd-gzh-quality-copilot.md` §4 FR-5/6/8/11/12；§7 SM-2
- architecture — `architecture-gzh-quality-copilot/architecture-gzh-quality-copilot.md` AD-3, AD-4
- prior dogfood — `dogfood/2026-10-20/`（体感落差来源）
- deferred — `deferred-work.md`（登录态 UI、自动翻页仍不在本 epic）

## Notes

- Decision: 2026-10-20 — 用户选顺序 A：扩展指标 → Skill(诊断+能发) → 评测固化。  
- Decision: 2026-10-20 — 用户 Approve 本 epic 四票拆法（含 closing Refactor sweep）。  
- Tracer: entry 1 Extension list metrics enrichment.  
- Unknown: 微信列表页阅读数字段 DOM/内嵌 JSON 位置因改版而变；entry 1 以 HITL 冒烟为准，拿不到则 `_missing` + 文档说明，不发明 host。  
- Waits on epic-extension-export because: 已有 MV3 列表抽取骨架。  
- Waits on epic-skills-diagnosis because: 已有 gzh-review + contracts + references。  
