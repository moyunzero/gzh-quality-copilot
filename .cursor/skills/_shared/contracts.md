# Shared diagnosis contracts

Normative rules for any Skill that claims review / full report (AD-4). Cite this file; do not fork private copies.

## Article-count degradation (FR-6)

Count = historical articles in the author's own corpus for this run (not read volume).

| 历史篇数 | 行为 |
|---------|------|
| ≥30 | 允许相对排序 + Top 因子；阅读极低时因子标【低置信】 |
| 10–29 | 粗分「稍好 / 普通 / 较差」+ 结构对照 + 1–2 实验；不做细分位 |
| &lt;10 | 不做排序；结构规律摘要 + 对标粘贴 + 1 个结构实验 |
| 几乎无稿 | 检查清单模式；不编造个人史证据 |

**Hard rules**

- &lt;10 / 几乎无稿：明确声明「不做个人史排序」；不得输出细粒度相对排名表。  
- 不得将「阅读量个位数」表述为无权使用；高篇数 + 低阅读仍可相对复盘，但须标【低置信】。

## Four-block report order (FR-12)

Output **exactly this order** (Markdown headings). Degradation may weaken depth of a block; it must not replace the skeleton with free-form chat.

1. **结论**
2. **因子**
3. **候选**
4. **实验**

Suggested heading labels (UX sample): `## 01 结论` → `## 02 因子` → `## 03 候选` → `## 04 实验`.

## Evidence and badges (FR-11)

- Important claims need an evidence snippet (table row id, quote, or `references/` entry).  
- If no snippet: mark with literal **`【推测】`**.  
- Low confidence under high-count / low-read: mark with literal **`【低置信】`**.

Badge literals are plain text (Agent Markdown has no CSS). Do not invent alternate spellings.

## Diagnose-side `sf-*` cite (FR-8)

For runs with **≥10** articles: the report must include **≥1 substantive** cite of a `references/sf-*` entry — name `sf-0N` and state which signal was used on which row/title/opening. Bare name-drop without evidence link does not count.

## Shippable `## 04 实验` shape

Any report that emits `## 04 实验` must include all of:

1. **可粘贴标题** — a paste-ready title line  
2. **开头写法（约 150 字）** — opening writing spec the author can draft from  
3. **只改一个变量** — single-variable constraint  
4. **发后回灌** — re-export / paste and compare against this experiment

Do not add a fifth report block. Do not copy this file's degradation table into Skill text.
