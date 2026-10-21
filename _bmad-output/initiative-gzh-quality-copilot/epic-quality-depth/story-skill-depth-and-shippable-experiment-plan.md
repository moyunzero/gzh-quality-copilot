---
title: 'Skill depth and shippable experiment'
type: 'feature'
ticket: '2'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dogfood shows Skill reports that still stack near-duplicate「物件+异常」factors, treat `sf-*` as optional name-drops, and leave `## 04 实验` without a pasteable title + ~150-字 opening writing spec — so authors cannot ship the next post from the report alone. Ticket 5.2 / FR-6·8·11·12 deepen.

**Approach:** Tighten normative Skill (+ contracts only as needed): for ≥10 篇 runs, require ≥2 non-repeating factor dimensions with evidence and ≥1 substantive `references/sf-*` cite; make `## 04 实验` always include pasteable title + ~150-字 opening writing spec + single-variable constraint; keep `<10`「不做个人史排序」and ban recommendation/algorithm narratives. Sync Cursor/Agents skill mirrors; align sample reports to the new 04 shape.

## Boundaries & Constraints

**Always:**
- Cite `skills/_shared/contracts.md`; do not fork or rewrite the degradation table.
- Four-block headings unchanged: `## 01 结论` … `## 04 实验`.
- No recommendation-algorithm causal claims; no「必爆」; no fetch URL / no scrape other accounts.
- Gold `<10` path still declares **不做个人史排序** (verify must not regress).
- Keep `skills/gzh-review/SKILL.md` as canonical; `.cursor/skills/` and `.agents/skills/` stay byte-synced for the files this story edits.

**Never:**
- No extension / DOM / README install matrix / LICENSE / eval harness (those are 5.1 / 5.3).
- No fifth report block; no copying contracts degradation table into SKILL.
- No inventing new badge literals beyond `【推测】` / `【低置信】`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| ≥10 / ≥30 sample | band-10-29 or band-30 / dogfood ≥10 | ≥2 factors on **different** dimensions (e.g. title vs opening vs rhythm); each with evidence; ≥1 names `sf-0N` with what signal was used | If cannot cite sf: do not invent — mark claim `【推测】` and still cite one sf from structure对照 |
| Duplicate factors | Model tempted to restate「物件+异常」twice | Reject as one pattern; second factor must be another dimension | Skill text forbids same-pattern restatement |
| `## 04 实验` | Any band that emits 04 | Must list: (1) pasteable title line, (2) ~150 字/字 opening writing spec, (3) single-variable constraint + 发后回灌 | Missing any → incomplete vs 5.2 |
| `<10` / gold 3 | `examples/articles.interchange.json` | 文首 **不做个人史排序**; 04 still has title+opening-spec+one variable | No ranking tables |
| Reco / 推流 talk | Metrics「推荐占比」temptation | Not a factor; may note as channel observation only with hard ban on algorithm causality — prefer omit | Skill bans 推荐/推流/算法因果 as 因子 |

</frozen-after-approval>

## Code Map

- `skills/gzh-review/SKILL.md` — primary:档位 ≥10 rules, 因子去重, 强制 sf-*, 04 三要素, 禁推荐叙事. Sync → `.cursor/skills/gzh-review/SKILL.md`, `.agents/skills/gzh-review/SKILL.md`.
- `skills/_shared/contracts.md` — add short norms: FR-8 diagnose-side ≥1 substantive `sf-*` cite for ≥10; 04 shippable shape (title + ~150 opening + one variable). Sync `.cursor` / `.agents` `_shared` twins.
- `examples/sample-report.md` / `examples/sample-report-band-30.md` — update `## 04 实验` (and light 因子 sf cite if missing) so shapes match Skill.
- `references/index.md` — reuse only (sf-01…05 ids); do not rewrite corpus.
- `dogfood/2026-10-20/report.md` — evidence of current gap; optional one-line stale note or leave for 5.3 re-run (do not require full rewrite).
- Continuity from 5.1: extension untouched.

## Tasks & Acceptance

**Execution:**
- [x] `skills/gzh-review/SKILL.md` — tighten ≥10 因子≥2 + non-repeat dimensions; mandatory ≥1 sf-* cite; 04 title + ~150 opening + single variable; ban 推荐/算法因果 as factors — ticket verify
- [x] `.cursor/skills/gzh-review/SKILL.md` + `.agents/skills/gzh-review/SKILL.md` — byte-sync with canonical — install paths
- [x] `skills/_shared/contracts.md` (+ `.cursor`/`.agents` twins) — FR-8 diagnose cite + 04 shippable shape bullets without forking degradation table — AD-4 single source
- [x] `examples/sample-report.md` + `examples/sample-report-band-30.md` — 04 matches new shape; ≥1 sf cite in sample factors where missing — shape gold

**Acceptance Criteria:**
- Given a ≥10-article sample (band fixture or dogfood), when Skill instructions are followed, then the report has ≥2 non-duplicate factor dimensions with evidence and ≥1 substantive `sf-*` citation.
- Given any Skill report with `## 04 实验`, when inspected, then it contains a pasteable title, an ~150-字 opening writing spec, and a single-variable constraint.
- Given gold `<10` interchange, when Skill runs, then the report still declares **不做个人史排序**.
- Given contracts + three skill install trees, when compared, then edited files stay mirrored (no drift).

## Implementation Notes

- 2026-10-20: Canonical Skill + contracts updated; mirrored to `.cursor` / `.agents`. Samples (`sample-report.md`, `sample-report-band-30.md`) aligned to 04 四要素 + substantive sf cites. Dogfood report left as-is for 5.3 re-run (optional stale note not added). Verify: `diff -q` mirrors identical; `rg` hits for 可粘贴标题 / 约 150 / sf-0 / 不做个人史排序 / 非重复 / 推荐算法.
- 2026-10-20 review patches: sf-* no bare fallback; contracts 04 = 4 items; 几乎无稿 if emits 04 → same shape; sample openings ~150 字; band-30 #16 title-axis对照.
- Review fixes: ≥10 sf cite always needs signal+row (no bare name-drop after 【推测】); contracts 04 lists 发后回灌 as 4th item; 几乎无稿 04 shape line; sample 开头写法 expanded ~150 字; band-30 factor2 对照改为 #16 标题前段.

## Plan Change Log

## Review Triage Log

- 2026-10-20 quick: 5 findings classified; 0 deferred; patches applied then re-verified (mirrors + rg).
- medium, patch — Skill sf-* fallback allowed bare name-drop vs contracts FR-8 → ≥10 always requires signal + row-level对照.
- medium, patch — contracts 04 listed 3 items vs Skill 4 labels → contracts now lists 发后回灌 as item 4.
- low, patch — 几乎无稿 omitted 04 shape when emitting 04 → one-line same-shape requirement added.
- medium, patch — sample 开头写法 ~100-char meta → expanded to ~150 字 concrete writing guidance.
- medium, patch — band-30 factor 2 used #16 body for 标题轴 →对照改为 #16 标题前段.

## Design Notes

**Non-repeating factors:** Dimensions differ by structural axis — e.g. 标题前段形态 (sf-03) vs 开场落地 (sf-01/sf-02) vs 段落节拍 (sf-04) vs 末句 (sf-05) vs 发布时间桶。Two bullets that only rephrase「物件+异常」count as **one** pattern.

**Substantive sf cite:** Name `sf-0N` and state which signal was used on which row/title/opening — not bare「(sf-01)」with no link to evidence.

**04 template (minimal):**
```markdown
## 04 实验
- **可粘贴标题：** 《……》
- **开头写法（约 150 字）：** ……
- **只改一个变量：** ……
- **发后回灌：** ……
```

## Verification

**Commands:**
- `diff -q skills/gzh-review/SKILL.md .cursor/skills/gzh-review/SKILL.md && diff -q skills/gzh-review/SKILL.md .agents/skills/gzh-review/SKILL.md` -- expected: no output (identical)
- `diff -q skills/_shared/contracts.md .cursor/skills/_shared/contracts.md && diff -q skills/_shared/contracts.md .agents/skills/_shared/contracts.md` -- expected: no output
- `rg -n '可粘贴标题|约 150|sf-0|不做个人史排序|非重复|推荐算法' skills/gzh-review/SKILL.md skills/_shared/contracts.md examples/sample-report.md examples/sample-report-band-30.md` -- expected: hits for new norms + samples

**Manual checks (if no CLI):**
- Mentally apply Skill to `examples/articles.band-30.json` shape: factors ≥2 distinct + sf cite + 04 three parts; to `examples/articles.interchange.json`: 不做个人史排序 retained.
