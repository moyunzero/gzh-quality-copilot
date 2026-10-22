# Walkthrough: Epic-6 maturity closed loop

Target: Epic `epic-maturity-extension-eval` — CAP-1 pre-export status · CAP-2 opt-in multi-page export · CAP-3 mid/high eval fixtures  
Purpose: Human review that 6.1–6.3 form a closed maturity loop (status → export → score mid/high) without inventing corpus or relaxing privacy/contracts

**Review status:** finished (Wrap-up 2026-10-22) · follow-through: deferred rows + 6.3 done + commit/push

## Blocks

- [x] **1. Intent** — accepted · unchanged during review
- [x] **2. Broad strokes** — accepted · Thoughts gaps deferred (user)
- [x] **3. Slice A: Pre-export login/list status (6.1)** — accepted · Thoughts: path heuristic OK by design
- [x] **4. Slice B: Opt-in multi-page export (6.2)** — accepted · mechanism OK; quality debt deferred
- [x] **5. Slice C: Eval mid/high fixtures (6.3)** — accepted · fixtures+docs OK; dated mid/high run deferred
- [x] **6. Periphery** — accepted · 6.3 was built→done; 6.4 next

---

## 1. Intent

**State:** accepted

Source note: User chose walkthrough target「2 Epic-6 整段」; intents adapted from [epic-maturity-extension-eval.md](../epic-maturity-extension-eval/epic-maturity-extension-eval.md) Done when + CAP-1..3 and the three story plan frozen Intent blocks.

关闭 MVP 后延期的成熟度债：作者打开扩展就能读到「是否在本号已发表列表」；勾选后才翻全号并可取消；陌生人能用从 `sample.json` 合成的 mid/high 夹具按现有四维量表跑 Skill vs 裸聊，并知道改 Skill/契约后何时重跑。不改 contracts 档位数字、不加新权限主机、不把 private 语料检入 eval。

---

## 2. Broad strokes

**State:** accepted

五个入口点，按成熟度闭环顺序打开：

1. [extension/src/popup.ts](../../../extension/src/popup.ts) — 打开即 `tabExportContext` 状态；勾选「翻完所有页」后后台翻页
2. [extension/src/background.ts](../../../extension/src/background.ts) — `begin=` URL 多页编排 + 下载（弹窗可关）
3. [extension/src/content-list.ts](../../../extension/src/content-list.ts) — 单页抽取 / `EXTRACT_LIST_PAGE_META`
4. [dogfood/eval/README.md](../../../dogfood/eval/README.md) — 分档 fixture + 重跑 + 自检
5. [dogfood/eval/sample-mid.json](../../../dogfood/eval/sample-mid.json) / [sample-high.json](../../../dogfood/eval/sample-high.json) — 15 / 30 合成夹具

走查注记（Thoughts · 用户：先记着不修）：
1. 尚无 mid/high 的 dated Skill vs 裸聊记分样例（仅有 &lt;10 的 `2026-10-21`）— 能力在、对照跑次未补。
2. 多页导出近重标题 /「已修改」脏文案 — 导出质量债，非本五入口缺口；宜后续小票或 6.4。

---

## 3. Slice A: Pre-export login/list status (6.1)

**State:** accepted

关注点：不点「导出」也能看到列表/非列表状态。

机制：popup 加载时查询活动标签，用与导出相同的 `isMpListUrl` / `tabExportContext` 分类，写入 `#status`。导出路径本身不因本切片改契约。

- [extension/src/logic.ts](../../../extension/src/logic.ts) — `tabExportContext` / `isMpListUrl`
- [extension/src/popup.ts](../../../extension/src/popup.ts) — 加载时刷新状态
- [extension/test/tracer.test.mjs](../../../extension/test/tracer.test.mjs) — 分类与预导出状态断言

走查注记：CAP-1 达标；mp 非列表「请先登录」为路径启发式，非真登录探测（按设计）。

---

## 4. Slice B: Opt-in multi-page export (6.2)

**State:** accepted

关注点：默认仍当前页；勾选后翻全号；可取消；下载不被关弹窗打断。

机制：微信列表整页刷新会杀掉 content-script 点击翻页。Service worker 循环：注入/询问 page meta → 合并行 → `tabs.update(next begin= URL)` → 保活 → 末次 `downloads`。取消置 SW 标志。

- [extension/src/background.ts](../../../extension/src/background.ts) — 多页循环与下载
- [extension/src/logic.ts](../../../extension/src/logic.ts) — `computeNextListPageUrl` / `mergePageRows`
- [extension/popup.html](../../../extension/popup.html) — 「翻完所有页」+ 取消

走查注记：SW `begin=` 路径正确；HITL 已能下文件；近重/脏标题仍 deferred。

---

## 5. Slice C: Eval mid/high fixtures (6.3)

**State:** accepted

关注点：陌生人能对 10–29 / ≥30 档打分而不发明语料；contracts 档位不变。

机制：从钉死的 8 篇 `sample.json` 合成 mid(15)/high(30)；README 写清分档打分、重跑触发、可选自检；rubric 维度 1 按档位判 Pass。

- [dogfood/eval/sample-mid.json](../../../dogfood/eval/sample-mid.json) · [sample-high.json](../../../dogfood/eval/sample-high.json)
- [dogfood/eval/README.md](../../../dogfood/eval/README.md) — 分档 / 重跑 / 自检
- [dogfood/eval/rubric.md](../../../dogfood/eval/rubric.md) — 四维；维度 1 分档

走查注记：夹具与文档达标；dated mid/high 记分样例仍 deferred。

---

## 6. Periphery

**State:** accepted

- [epic-maturity-extension-eval/tickets.toml](../epic-maturity-extension-eval/tickets.toml) — 票序 6.1→6.2→6.3→6.4
- [story-pre-export-login-list-status-plan.md](../epic-maturity-extension-eval/story-pre-export-login-list-status-plan.md) — 6.1 done
- [story-opt-in-multi-page-export-with-cancel-plan.md](../epic-maturity-extension-eval/story-opt-in-multi-page-export-with-cancel-plan.md) — 6.2 done
- [story-eval-mid-high-synthetic-fixtures-and-re-run-process-plan.md](../epic-maturity-extension-eval/story-eval-mid-high-synthetic-fixtures-and-re-run-process-plan.md) — 6.3 done（wrap-up）
- [deferred-work.md](../deferred-work.md) — 走查两项缺口 + 既有 pager fixture CI 债

走查结论：Epic-6 CAP-1..3 能力闭环成立；后续 6.4 清扫 + deferred 增强（mid/high dated 跑次、导出去重/清标题）。
