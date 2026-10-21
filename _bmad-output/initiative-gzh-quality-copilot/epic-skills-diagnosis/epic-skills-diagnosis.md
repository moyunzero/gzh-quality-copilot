---
type: epic
title: "Skills diagnosis loop"
parent: initiative-gzh-quality-copilot
covers: [FR-4, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12]
after: []
assignee: ""
risk: high
status: done
---

# Skills diagnosis loop

## Description

在作者 Agent 中交付可粘贴运行的诊断 Skills：强制篇数降级、四块报告、依据/推测，并提供 ≥5 条可审计短篇结构摘要。

## Outcome

作者仅用粘贴/示例数据即可得到可检查的复盘+实验清单；与裸聊相比流程差可演示。

## Done when

1. 粘贴金样可产出四块报告，且 `<10` 篇夹具不出现细分位排序。  
2. 重要因子至少一条带依据片段；无依据标【推测】。  
3. `references/` ≥5 条短篇摘要，无全文、有出处清单。  
4. 对标粘贴路径可用并声明「价值判断由作者定」。  
5. Skills 引用 `_shared/contracts.md`，无私自改降级表。

## Requirements

- FR-4: Skill 接受粘贴或文件（JSON 与 CSV）；本 epic 不写 README「永久降级」句（留给 epic-launch-readme-gate）。  
- FR-6: 篇数降级 — 2.1 交 &lt;10；2.3 交 10–29 / ≥30 / 几乎无稿；2.4 交 &lt;10 的对标/摘要段。降级表只引用 `skills/_shared/contracts.md`。  
- FR-7: 2.1 交 &lt;10「不做个人史排序」；2.3 交其余档深度与「不声称算法因果」。  
- FR-8: `references/` ≥5 条短篇结构摘要 + 出处页；每条含结构信号与可核对出处；无全文、无空壳。  
- FR-9: 可选对标粘贴（作者贴正文，不拉 URL）；三维：开头钩子 / 标题结构 / 段落节奏；声明「价值判断由作者定」；无粘贴时用 `references/`。  
- FR-10: ≥3 标题候选 + 1–3 单变量实验 + 发后回灌提示。  
- FR-11: 至少一条可定位依据；无依据才标【推测】。  
- FR-12: 四块顺序以 contracts.md 为准。

## Boundaries

Skills + references。不实现扩展；不代发；不扒竞品真阅读。不新增 per-Skill `references/`（AD-6）。

## References

- architecture — architecture-gzh-quality-copilot.md AD-4, AD-5, AD-6  
- prd — prd-gzh-quality-copilot.md FR-4, FR-6–12；addendum.md §E  
- ux — EXPERIENCE.md F-1/F-2；.working/sample-report.md  
- foundation — skills/_shared/contracts.md；examples/articles.interchange.json  

## Notes

- Waits on epic-foundation-scaffold because: gold sample + contracts.  
- Unknown: 1 vs 3 Skill 包拆分 — Deferred；实现可选单包编排。  
- Decision: 2026-10-20 — 单包路径 `skills/gzh-review/`（用户确认默认）。  
- Decision: 2026-10-20 — ≥30 验收 = 检入样例报告 + SKILL 条文（不另加 hitl 跑）。  
- Decision: 2026-10-20 — tracer `hitl: true`：作者在 Agent 对金样跑一遍。  
- Decision: 2026-10-20 — 保留 Refactor sweep（用户确认默认）。  
- Decision: 2026-10-20 — tracer = 2.1 Review Skill 粘贴金样；2 after 1.1 与 1 并行（`references/` 车道）；3 after 1（同一 SKILL.md）；4 after 2+3（对标依赖摘要，且防撞）；sweep after 1–4。4 after 3 不是 FR-7 依赖 FR-9。  
- Decision: 2026-10-20 — 几乎无稿 = 空粘贴或 1 篇 → SKILL 检查清单；不强制第三份夹具。  
- Decision: 2026-10-20 — 对标「链接」= 作者粘贴正文，Skills 不 fetch URL（AD-3）。  
- High-risk check outside 2.1 criteria: 作者本人在 Agent 跑金样（hitl）。  
- Decision: 2026-10-20 — closure：2.1–2.5 `done`；Done when 1–5 对照 Skill/金样跑通、references ≥5、对标条文、contracts 引用核对通过；无 dropped 子项；标 epic `status: done`。  
