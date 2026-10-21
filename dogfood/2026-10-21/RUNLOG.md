# Dogfood · 2026-10-21

## A. 作者粘贴 10 篇（非 eval 量表）

见 `../private/2026-10-21-paste.json`（本号真实导出，**不入库**）/ 当时 `skill-out` 备份意图：该跑不入 `eval/rubric`（换样本则量表无效）。正式 harness 见下。

## B. Eval harness（Skill vs 裸聊）

按 [`../eval/README.md`](../eval/README.md)：

1. **样本（钉死）：** `../eval/sample.json`（8 篇）
2. **Skill 路径：** 加载 `gzh-review` + contracts → `skill-out.md`（含 04 四要素）
3. **裸聊路径：** 独立 Agent，禁读 Skill/contracts/rubric → `bare-out.md`
4. **打分：** `scoresheet.md`（量表 `../eval/rubric.md`）
5. **一眼差：** `compare-note.md`
6. **未改：** `../2026-10-20/*`、`skills/`、`extension/`
