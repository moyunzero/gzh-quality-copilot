---
type: epic
title: "Foundation scaffold"
parent: initiative-gzh-quality-copilot
covers: [FR-3, FR-13]
after: []
assignee: ""
risk: low
status: done
---

# Foundation scaffold

## Description

冷启动仓库骨架：金样 interchange、共享诊断契约、示例报告、README/LICENSE 占位，使后续 Skills 与扩展有同一契约可依。

## Outcome

任意后续 epic 都能引用 `examples/articles.interchange.json` 与 `skills/_shared/contracts.md`，而无需再争论字段或四块骨架。

## Requirements

- FR-13: 示例数据与演示路径 — 金样 interchange + sample-report（PRD §4.5）。  
- FR-3: 新人/老人预期对齐文案 — README 占位句（完整 README 在 epic-launch-readme-gate）。  
- AD-3 / AD-4: 金样路径与 `_shared/contracts.md`（architecture spine）。  
- E1 (scaffold): 仓库目录树符合 Structural Seed。  
- E2 (stubs): LICENSE / README 安装占位不阻断后续 epic。

## Done when

1. 仓库树符合 architecture Structural Seed（skills/_shared、references/、examples/、extension/ 占位可空实现）。  
2. `examples/articles.interchange.json` 存在且字段覆盖 AD-3 种子列表。  
3. `skills/_shared/contracts.md` 含篇数降级表与四块输出顺序。  
4. `examples/sample-report.md` 展示四块 + 角标文字约定。  
5. README 含预期对齐句占位；LICENSE 文件占位或注明待选 SPDX。

## Boundaries

仅脚手架与契约文件。不含 Skill 提示词逻辑、不含扩展 DOM、不含完整隐私清单定稿。

## References

- architecture — architecture-gzh-quality-copilot.md AD-3, AD-4, Structural Seed  
- prd — FR-3, FR-13；addendum 输入契约  
- ux — `.working/sample-report.md`, sample-readme-outline  

## Notes

- Decision: 2026-10-20 — opening epic = platform baseline（用户确认四 epic 集）。  
- Decision: 2026-10-20 — inception：5 stories；**tracer = 1.1 scaffold dirs**（最薄路径：目录 → 并行金样+契约 → 样例报告 → README 链到产物）；declined refactor-sweep（epic 过小，>3 条但无代码债）。  
- Decision: 2026-10-20 — LICENSE 仅 stub（SPDX 选定留给 epic-launch-readme-gate / 发 tag 前）。  
- Decision: 2026-10-20 — entry 2 与 3 可并行（金样字段来自 AD-3，契约来自 FR-6；互不定义对方）；entry 5 after 2+3+4 以便 README 链接已存在文件。  
- Decision: 2026-10-20 — closure：1.1–1.5 `done`；Done when 1–5 对照仓库产物核对通过；标 epic `status: done`。  


