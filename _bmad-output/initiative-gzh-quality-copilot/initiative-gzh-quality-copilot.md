---
type: initiative
title: "公众号质量 Copilot（gzh-quality-copilot）"
parent: none
covers: [FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14]
after: []
assignee: ""
risk: medium
---

# 公众号质量 Copilot（gzh-quality-copilot）

## Description

开源交付「自有数据 → 相对复盘 → 结构对照 → 可验证实验」闭环：Agent Skills + 本号导出扩展 + README。不承诺推荐/爆款。PRD 与 architecture spine、UX 双脊为需求与一致性来源。

## Outcome

外部作者不改代码即可「导入（示例或粘贴）→ 四块报告」；首个公开 tag 含可用扩展、金样契约、≥5 条短篇 references，以及与 manifest 一致的权限/隐私 README。

## Requirements

- FR-1…FR-14：见 `prd-gzh-quality-copilot/prd-gzh-quality-copilot.md` §4（稳定 id，子 epic `covers` 引用）。
- AD-1…AD-7：见 `architecture-gzh-quality-copilot/architecture-gzh-quality-copilot.md`（实现不变量）。

## Done when

1. 粘贴金样 JSON 可跑出符合 `_shared/contracts.md` 的四块报告（含篇数降级与依据/推测）。  
2. 首发含可用 MV3 扩展，导出对齐 `examples/articles.interchange.json`。  
3. `references/` ≥5 条短篇结构摘要且无全文、有出处。  
4. README 含安装、预期对齐、三层隐私、禁令；权限清单与 `extension/manifest.json` 一致。  
5. Dogfood 竖切与 Skill vs 裸聊对照清单可勾选（PRD §6.3）。  
6. 根目录存在已选定 SPDX 的 LICENSE（发 tag 前）。

## Boundaries

能力边界：Skills + 扩展 + 文档/示例。非托管 SaaS、非代发、非扒竞品真阅读。Tracer：粘贴金样 → Skills 四块报告（不依赖扩展）；扩展后补齐本号导出。

- Touch point: 微信公众号后台 DOM — 仅消费登录态本号已发表页；owner: epic-extension-export  
- Touch point: 作者选用的 Agent / 模型 API — 本仓库不托管；owner: epic-skills-diagnosis  

## References

- prd — `_bmad-output/initiative-gzh-quality-copilot/prd-gzh-quality-copilot/`
- architecture — `_bmad-output/initiative-gzh-quality-copilot/architecture-gzh-quality-copilot/architecture-gzh-quality-copilot.md`
- ux — `_bmad-output/initiative-gzh-quality-copilot/ux-gzh-quality-copilot/`
- prfaq — `_bmad-output/initiative-gzh-quality-copilot/prfaq-gzh-quality-copilot/`

## Notes

- Decision: 2026-10-20 — 四 epic 切分确认：foundation-scaffold → skills-diagnosis → extension-export → launch-readme-gate。  
- Decision: 2026-10-20 — 首发必须含可用扩展；粘贴为发版后降级。  
- Decision: 2026-10-20 — LICENSE SPDX = MIT（epic-launch-readme-gate 4.5）。  
- Decision: 2026-10-20 — 新增 epic-quality-depth（id 5）：顺序 A = 扩展指标 → Skill 诊断+能发 → 评测固化；用户 Approve 四票拆法。  
- Open question: Skill 1 vs 3 包 — 可延后。  
