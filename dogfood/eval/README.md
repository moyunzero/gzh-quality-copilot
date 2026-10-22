# Eval harness · Skill vs 裸聊

**同一份固定样本 · 两次独立 Agent · 四维 Pass/Fail。**  
陌生人可复现。不发明新语料，不跑 LLM CI。

用本目录钉死的 fixture（见下表），分别走 **Skill 路径**与 **裸聊路径**，再按 [`rubric.md`](rubric.md) 填记分表。目标：证明 `gzh-review` 在「降级声明 / 四块骨架 / 可发实验」上相对裸聊可拉开，而不是凭感觉说「Skill 更好」。

| | |
|---|---|
| **量表** | [`rubric.md`](rubric.md) — 四维，不加权；维度 1 按档位判 Pass |
| **空白表** | [`scoresheet.template.md`](scoresheet.template.md) — 复制后填（须记录 fixture / 档位） |
| **样本** | 下表钉死 JSON — **换档须换对应文件**；勿用 `dogfood/private/` 或 `examples/articles.band-*.json` 当 eval 源 |
| **安装 Skill** | 仓库根 [`README.md`](../../README.md) |

### 分档 fixture

| 档位 | 文件 | 篇数 | 说明 |
|------|------|------|------|
| &lt;10 | [`sample.json`](sample.json) | 8 | 钉死种子；Quick Start 默认 |
| 10–29 | [`sample-mid.json`](sample-mid.json) | 15 | 由 `sample.json` 合成（`M01…`）；仅 CAP-3 用 |
| ≥30 | [`sample-high.json`](sample-high.json) | 30 | 同上（`H01…`） |

---

## Quick Start

默认跑 **&lt;10** 档（8 篇）：

```text
1. 复制 scoresheet.template.md → 另存为本次 scoresheet.md（填上 fixture 路径与档位）
2. 会话 A：加载 gzh-review + 本目录 sample.json → 保存 skill-out.md
3. 会话 B：新开、禁读 Skill/契约 + 同一份 sample.json → 保存 bare-out.md
4. 打开 rubric.md，对两份报告逐维判 Pass/Fail，写入记分表
```

两边必须是**不同的** Agent 会话，避免上下文串味。

### 打 mid / high

把上面步骤 2–3 的 JSON 换成 `sample-mid.json` 或 `sample-high.json`（A/B **同一份**）。记分表写明档位。维度 1 按 [`rubric.md`](rubric.md) 的档位条件判（mid：粗分三档且不做细分位；high：允许相对排序）。Skill 路径在 mid/high 上若仍写「不做个人史排序」→ 维度 1 **Fail**。

---

## 目录里有什么

| 文件 | 用途 |
|------|------|
| `sample.json` | 钉死的 8 篇语料（&lt;10 档） |
| `sample-mid.json` | 合成 15 篇（10–29 档） |
| `sample-high.json` | 合成 30 篇（≥30 档） |
| `rubric.md` | Pass/Fail 证据规则（四维） |
| `scoresheet.template.md` | 空白记分表 |
| `README.md` | 本页 |

跑次产出请放到日期目录（例如 `../2026-10-21/`），**不要**改本目录里的钉死 fixture。

---

## 协议

### A · Skill 路径

1. 新开 Agent；**强制加载** `gzh-review`（并保证 `skills/_shared` 可用）。  
   Cursor 一例（仓库根）：

   ```bash
   npx skills add . --skill gzh-review -a cursor -y
   ```

2. 用户句大意：「按 Skill 复盘」+ 粘贴或附上本目录所选 fixture（`sample.json` / `sample-mid.json` / `sample-high.json`）。  
3. 保存完整报告（如 `skill-out.md`）。

### B · 裸聊路径

1. **另一个**新开 Agent。  
2. **禁止**读取：`skills/gzh-review`、`skills/_shared/contracts`、本目录 `rubric.md`，以及任何 gzh-review 契约/样例报告（避免「背答案」）。  
3. 用户句仅类似：「帮我复盘一下这份数据」+ **与 A 同一份** fixture。  
4. 保存完整报告（如 `bare-out.md`）。

### C · 打分

1. 打开 [`rubric.md`](rubric.md)，逐维只判 **Pass** 或 **Fail**（备注可摘一句原文）。维度 1 先确认本次档位再判。  
2. 填入你的 `scoresheet.md`（含 fixture 路径 / 档位）。  
3. 可选：写一眼差异 `compare-note.md`、跑通记录 `RUNLOG.md`；可选走下方 **报告自检**。

### 可复制提示词

**Skill 会话（&lt;10 默认）：**

```text
请按 gzh-review Skill 复盘。输入是本仓库 dogfood/eval/sample.json（8 篇）。
输出完整四块报告，不要省略 04 实验四要素。
```

**Skill 会话（mid / high）：** 把路径与篇数换成 `sample-mid.json`（15 篇）或 `sample-high.json`（30 篇）。

**裸聊会话：**

```text
帮我复盘一下这份公众号数据（JSON 如下 / 见附件）。
不要读取仓库里的 Skill、契约或评分表。
```

---

## 期望长什么样（非硬编码分数）

| 路径 | 降级声明 | 依据锚点 | 四块 `## 01–04` | 04 四要素 |
|------|----------|----------|-----------------|-----------|
| Skill（加载 gzh-review） | 多半 Pass（须匹配档位） | 多半 Pass | 多半 Pass | 多半 Pass |
| 裸聊（禁读 Skill） | 多半 Fail | 偶发 Pass | 多半 Fail | 多半 Fail |

诚实评分：偶发裸聊某维 Pass、偶发 Skill 某维 Fail 都正常——**以量表证据为准**。

---

## 改 Skill / 契约后何时重跑

以下任一发生时，应重跑 A/B（至少对受影响档位），并把产出归档到**新的**日期目录（如 `../2026-10-22/`）；**不要**改动钉死的 `sample*.json` / `rubric.md` 来「刷分」：

- `skills/gzh-review` 行为变更（提示、流程、输出形状）
- `skills/_shared/contracts.md` 降级表、四块或 04 形状变更
- 想验证 mid/high 路径是否仍相对裸聊可拉开

未改 Skill/契约、仅想熟悉流程 → 用现有 dated 跑次对照即可，不必重跑。

---

## 可选：报告自检清单

打分前可扫一眼报告（**不作为** harness 硬门闩）：

- [ ] 降级档声明与本次 fixture 档位一致（&lt;10 / 10–29 / ≥30）
- [ ] 四块标题齐全且顺序为 `## 01` → `## 02` → `## 03` → `## 04`
- [ ] `## 04 实验` 含四要素：可粘贴标题 · 开头写法（约 150 字）· 只改一个变量 · 发后回灌
- [ ] 样本 ≥10 时，因子/观察带可核对锚点（行 id / 标题 / 引句；mid/high 常见 `M*` / `H*`）
- [ ] 打分 Skill 路径且 fixture ≥10 时：报告中 ≥1 处有实质内容的 `sf-*` 引用

---

## 已有跑次（对照用）

### 推荐：满分形态 · `../2026-10-21/`

按本 harness **重跑**后的完整样例（Skill 四维 Pass；裸聊在降级/四块/04 上 Fail，依据维偶发 Pass）：

| 文件 | 说明 |
|------|------|
| [`skill-out.md`](../2026-10-21/skill-out.md) | Skill 路径 |
| [`bare-out.md`](../2026-10-21/bare-out.md) | 裸聊路径 |
| [`scoresheet.md`](../2026-10-21/scoresheet.md) | 记分表 |
| [`compare-note.md`](../2026-10-21/compare-note.md) | 一眼差异 |
| [`RUNLOG.md`](../2026-10-21/RUNLOG.md) | 跑通记录 |

### 历史 · `../2026-10-20/`（LAUNCH 门闩证据 · **勿改**）

| 文件 | 说明 |
|------|------|
| `skill-out.md` / `bare-out.md` | 历史输出 |
| `compare-note.md` | 一眼差异（链回本 harness） |

**关于 dated `skill-out.md` 与维度 4：**  
该文件写于「04 四要素」落地之前：有「只改一个变量」「发后回灌」，但**缺少**独立标注的「可粘贴标题」与「开头写法（约 150 字）」→ 按**当前** `rubric.md` 应判维度 4 **Fail**。这是诚实标注，不是 Skill 永远 Fail。要看满分 04，请用 `2026-10-21` 或按上文 **A** 重跑。

历史文件仍适合演示：降级声明与四块顺序相对裸聊的反差。

---

## 不要做什么

- 不要改本目录的 `sample.json` / `sample-mid.json` / `sample-high.json` / `rubric.md` 来「刷分」  
- 不要在本跑次里改 `skills/`、`extension/`（评的是当前已发布行为）  
- 不要删改 `../2026-10-20/` 下的历史输出  
- 不要把 `contracts.md` 降级表整段抄进 `rubric.md`（量表只保留四个维度）  
- 不要用别的 JSON（含 `private/`、`examples/articles.band-*.json`）填本表却声称结果有效  

---

## 相关链接

- 产品总览与安装：[仓库 README](../../README.md)  
- 契约（篇数降级 / 四块 / 04 形状）：[`skills/_shared/contracts.md`](../../skills/_shared/contracts.md)  
- 发版门闩：[LAUNCH-GATES.md](../../LAUNCH-GATES.md)  
- 报告形状对照：[`examples/sample-report.md`](../../examples/sample-report.md)
