# Walkthrough: Author true path

Target: Whole author daily loop — Chrome MV3 list export → interchange JSON → gzh-review Skill diagnosis → dogfood/eval Skill-vs-bare scoring  
Purpose: Human review of the maintainer/author loop after initiative epics 1–5 are done

**Review status:** finished (Wrap-up 2026-10-21) · awaiting follow-through confirmation

## Blocks

- [x] **1. Intent** — accepted · unchanged during review
- [x] **2. Broad strokes** — accepted · Thoughts: keep five; contracts is Skill twin; eval = maintainer path
- [x] **3. Slice A: Extension export & privacy** — accepted · freeze solid; fragility deferred until after walkthrough
- [x] **4. Slice B: Interchange & missing fields** — accepted · gold body vs export _missing = doc note later
- [x] **5. Slice C: Skill diagnosis depth** — accepted · rubric-complete; depth≠insight engine (maturity later)
- [x] **6. Slice D: Eval harness** — accepted · demo gate OK; band fixtures/checklist = 后续修改
- [x] **7. Periphery** — accepted · set OK; optional LICENSE/sample-report/band fixtures not blocking

---

## 1. Intent

**State:** accepted

Source note: 用户选走查目标「1 整条真链路」；initiative 五 epic 已 done。Intent 改编自产品说明与 epic-quality-depth Done when（[README.md](../../../README.md) + epic-quality-depth）。

作者日常闭环：在已登录公众号后台列表页用扩展导出本号 JSON（尽量带阅读等指标；拿不到进 `_missing`），粘贴/打开给 [`gzh-review`](../../../skills/gzh-review/SKILL.md) 做相对复盘与可粘贴「04 实验」，再用 [`dogfood/eval/`](../../../dogfood/eval/README.md) 固定样本按表对照 Skill vs 裸聊。不为推荐/涨粉；自动翻页与登录态 UI 仍在 [deferred-work.md](../deferred-work.md)。

约束（用户 2026-10-21）：走查认可当前「小而可信」定位；**后续要持续拉高成熟度，目标无限接近完美**（不改本块赛道：仍不做新榜式大盘 / 必爆承诺）。

---

## 2. Broad strokes

**State:** accepted

五个入口点，按日常链路顺序打开：

1. [extension/src/popup.ts](../../../extension/src/popup.ts) — `onExport`：当前标签抽取 → 下载或粘贴 CTA
2. [extension/src/content-list.ts](../../../extension/src/content-list.ts) — 列表页抽取/合并指标（embedded + DOM）
3. [examples/articles.interchange.json](../../../examples/articles.interchange.json) — 金样 interchange 形状（Skill 输入契约）
4. [skills/gzh-review/SKILL.md](../../../skills/gzh-review/SKILL.md) — 档位降级 + 四块报告 + 因子/sf-*
5. [dogfood/eval/README.md](../../../dogfood/eval/README.md) — Skill vs 裸聊复现跑法与记分表

走查注记：保留五件套；[`contracts.md`](../../../skills/_shared/contracts.md) 为 Skill 静默孪生（切片 C）；eval 属维护者验证入口。

---

## 3. Slice A: Extension export & privacy

**State:** accepted

关注点：扩展如何在列表页忙态注入、抽取并导出，以及权限是否冻结在「仅本号后台」范围。

机制：弹窗 `onExport` 确认当前页是已发表列表 → `sendMessage` / 必要时 `scripting` 注入 content script → 合并 embedded JSON 与 DOM 指标 → 本地 `downloads`；失败走粘贴 CTA。权限白名单钉死在 manifest，与 README「会做」同源冻结。

- [extension/src/popup.ts](../../../extension/src/popup.ts) — popup busy / inject 与导出 CTA
- [extension/src/content-list.ts](../../../extension/src/content-list.ts) — 列表页指标合并（embedded + DOM）
- [extension/manifest.json](../../../extension/manifest.json) — permissions freeze：`downloads` / `tabs` / `scripting` + 仅 `mp.weixin` host

走查注记：隐私冻结可作标杆；导出脆弱（登录态预检 / 自动翻页）**走查结束后再开 epic**，不在本块改代码。

---

## 4. Slice B: Interchange & missing fields

**State:** accepted

关注点：Skill 输入契约形状，以及读不到的指标如何进 `_missing`、不抓正文。

机制：金样 `articles[]` 给出完整键集合；扩展 `normalizeArticles` 缺键进 `_missing`，且**始终省略 `body`**。Skill 按 JSON/CSV 嗅探输入，以有什么字段做什么深度，不编造。

- [examples/articles.interchange.json](../../../examples/articles.interchange.json) — 金样 JSON 形状（含演示用 `body`）
- [extension/src/logic.ts](../../../extension/src/logic.ts) — `normalizeArticles` / `_missing` 矩阵
- 对照：扩展真实导出通常无 `body` 键；金样有 `body` 仅为契约演示

走查注记：代码不改；README/金样旁注「导出无 body 属正常」**走查后**与成熟度债一并做（见 [deferred-work.md](../deferred-work.md)）。

---

## 5. Slice C: Skill diagnosis depth

**State:** accepted

关注点：诊断深度——契约、档位、可粘贴「04 实验」四要素，以及 sf-* 因子参考。

机制：`contracts.md` 钉死降级表与四块骨架；`gzh-review` 只引用不另造；≥10 篇要求非重复因子轴 + 实质 `sf-*`；任何发出的 `## 04 实验` 必须含可粘贴标题 / 开头写法 / 单变量 / 发后回灌。今日 `dogfood/2026-10-21/skill-out.md` 已按表全 Pass。

- [skills/_shared/contracts.md](../../../skills/_shared/contracts.md) — 输入/输出契约
- [skills/gzh-review/SKILL.md](../../../skills/gzh-review/SKILL.md) — 档位降级、四块报告、04 四要素
- [references/](../../../references/)（[sf-01](../../../references/sf-01-place-first.md) … [sf-05](../../../references/sf-05-withheld-line.md)）— 因子参考
- 证据：[dogfood/2026-10-21/skill-out.md](../../../dogfood/2026-10-21/skill-out.md)

走查注记：契约深度已够勾选；「接近完美」靠扩 references / 自检闸门 / 回归套件——**走查后**成熟度 epic，本块不改 Skill。

---

## 6. Slice D: Eval harness

**State:** accepted

关注点：固定样本下 Skill vs 裸聊的复现跑法与记分。

机制：钉死 [sample.json](../../../dogfood/eval/sample.json) → 两次独立 Agent（Skill / 裸聊）→ 按 [rubric.md](../../../dogfood/eval/rubric.md) 填表。今日重跑产出 [dogfood/2026-10-21/](../../../dogfood/2026-10-21/)（Skill 4×Pass；裸聊依据维偶发 Pass）；历史 [2026-10-20/](../../../dogfood/2026-10-20/) 勿改（dated skill-out 维度 4 仍 Fail，仅作对照）。

- [dogfood/eval/README.md](../../../dogfood/eval/README.md) — 跑法
- [dogfood/eval/sample.json](../../../dogfood/eval/sample.json) — 固定样本
- [dogfood/eval/rubric.md](../../../dogfood/eval/rubric.md) — 评分维度
- [dogfood/2026-10-21/scoresheet.md](../../../dogfood/2026-10-21/scoresheet.md) — 本轮记分
- Worked example（LAUNCH）：[dogfood/2026-10-20/](../../../dogfood/2026-10-20/)

走查注记：现 harness 可当演示/纪律回归闸门；分档样本、自检清单、改 Skill 必重跑等 **后续修改**（见 [deferred-work.md](../deferred-work.md)）。

---

## 7. Periphery

**State:** accepted

外围参考（各一句）：

- [README.md](../../../README.md) — 安装矩阵（扩展 + Skill + eval）
- [LAUNCH-GATES.md](../../../LAUNCH-GATES.md) — 上线门槛清单（已勾；证据含 2026-10-20）
- [deferred-work.md](../deferred-work.md) — 登录态 UI / 自动翻页 / README body 注 / eval 加厚
- [dogfood/2026-10-20/](../../../dogfood/2026-10-20/) — LAUNCH 证据目录
- [dogfood/2026-10-21/](../../../dogfood/2026-10-21/) — 本轮 eval 重跑（走查 Drive）

走查注记：日用外围齐全；`LICENSE` / `examples/sample-report*` / band JSON 可作成熟度旁注，非阻塞。
