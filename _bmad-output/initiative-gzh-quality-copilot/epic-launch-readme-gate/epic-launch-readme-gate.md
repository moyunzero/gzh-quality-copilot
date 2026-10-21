---
type: epic
title: "Launch README and gates"
parent: initiative-gzh-quality-copilot
covers: [FR-1, FR-2, FR-14]
after: []
assignee: ""
risk: medium
status: done
---

# Launch README and gates

## Description

定稿中文 README（安装矩阵、预期、三层隐私、禁令）并使权限清单与扩展 manifest 一致；补齐发版前 Dogfood / Skillvs裸聊门闩清单与 LICENSE。

## Outcome

陌生人按 README 可安装并跑通示例路径；公开 tag 前的文档与合规门闩可勾选关闭。

## Done when

1. README 含五端安装入口（或通用命令说明）、预期对齐、三层隐私、禁令句。  
2. 权限清单与 `extension/manifest.json` 一致（生成或 verbatim）。  
3. 演示节指向示例 CSV/JSON 与四块报告约定。  
4. Dogfood 竖切 + Skill vs 裸聊对照检查清单存在且可勾选。  
5. 根目录 LICENSE 为已选定 SPDX（或本 epic 含 hitl 选定步骤）。

## Boundaries

文档与发版门闩。不改 Skills 核心逻辑；不改扩展 DOM（只读 manifest）。

## References

- architecture — AD-7  
- prd — FR-1, FR-2, FR-14；§6.3  
- ux — README outline；Proof Desk（Markdown 节奏）  

## Notes

- Waits on epic-skills-diagnosis because: working report path for demo.  
- Waits on epic-extension-export because: manifest for checklist.  
- Decision: 2026-10-20 — 用户确认建议拆分：1 安装矩阵（示踪）→ 2 权限/三层隐私 → 3 禁令/粘贴 → 4 发版清单 → 5 LICENSE → 6 sweep；README 串行改写避免并行撞车。  
- Decision: 2026-10-20 — 安装 = 五端各一条（未知则指文档 + Cursor 示例）。  
- Decision: 2026-10-20 — SPDX = MIT（关闭原 open question）。  
- Decision: 2026-10-20 — 保留 closing Refactor sweep；不做单独 E2E 套件。  
- Tracer: entry 1 README install matrix.  
