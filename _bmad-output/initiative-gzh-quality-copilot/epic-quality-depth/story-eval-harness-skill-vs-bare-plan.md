---
title: 'Eval harness Skill vs bare'
type: 'feature'
ticket: '3'
created: '2026-10-21'
status: done
baseline_revision: 'NO_VCS'
route: 'full'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SM-2 needs a stranger-reproducible Skill vs bare compare, but dogfood only has an informal `compare-note.md` — no checked-in rubric, no eval folder, and no howto that scores degradation / evidence / four-block / shippable `## 04` after 5.2.

**Approach:** Add `dogfood/eval/` with a pinned sample (copy of the 8-article dogfood sample), a pass/fail scoring rubric covering those four dimensions, a short howto for independent Skill vs bare Agent runs, and a scoresheet template. Point from `compare-note.md`. Docs/fixtures only — no Skill or extension changes.

## Boundaries & Constraints

**Always:**
- Rubric dimensions: (1) 篇数降级声明, (2) 依据片段, (3) 四块顺序 `## 01–04`, (4) 可发实验形状（可粘贴标题 + 约 150 字开头写法 + 单变量 + 发后回灌）— align SM-2 + 5.2.
- Same sample for both paths; Skill path must load `gzh-review`; bare path must not load Skill/contracts.
- Sample lives under `dogfood/eval/` (or `examples/`); stranger can score without inventing a new corpus.
- Chinese-readable howto; pass/fail per dimension + short notes (no fancy weighting required).

**Never:**
- No edits to `skills/`, `extension/`, README install matrix, or LICENSE.
- No new product features; no automated CI that calls an LLM.
- Do not delete or rewrite `dogfood/2026-10-20/skill-out.md` / `bare-out.md` — link as worked examples only.
- Do not fork contracts degradation table into the rubric.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stranger scores Skill | `dogfood/eval/sample.json` + Skill report | Rubric rows fillable; Skill expected mostly Pass on all four dims | Missing 04 field → Fail that dim |
| Stranger scores bare | Same sample + bare chat | Bare typically Fail 降级/四块/04; evidence may partial | Still score honestly |
| Worked example | Existing `skill-out.md` / `bare-out.md` | Howto points to them; optional filled scoresheet shows expected contrast | Pre-5.2 skill-out may Fail 04 四要素 — note as dated |
| Wrong sample | Different JSON | Howto says: must use pinned `sample.json` | Rubric invalid if sample swapped |

</frozen-after-approval>

## Code Map

- `dogfood/eval/` — **new**: `README.md` (howto), `rubric.md`, `scoresheet.template.md`, `sample.json` (copy from `dogfood/2026-10-20/sample.json`).
- `dogfood/2026-10-20/compare-note.md` — add pointer to `../eval/` harness; keep existing table as quick glance.
- `dogfood/2026-10-20/skill-out.md`, `bare-out.md`, `SOURCE.md` — read-only references for howto examples.
- Continuity from 5.2: Skill now requires 04 四要素 — rubric must score that; dated skill-out may Fail 04 (document honestly).
- Do not touch: `skills/**`, `extension/**`, `examples/sample-report*.md` (already 5.2 gold).

## Tasks & Acceptance

**Execution:**
- [x] `dogfood/eval/sample.json` — copy pinned 8-article sample from `dogfood/2026-10-20/sample.json` — fixed corpus
- [x] `dogfood/eval/rubric.md` — pass/fail criteria for 降级 / 依据 / 四块 / 04 可发形状 — SM-2 + 5.2
- [x] `dogfood/eval/README.md` — howto: two independent Agents, load/forbid Skill, same sample, fill scoresheet — stranger run
- [x] `dogfood/eval/scoresheet.template.md` — blank Skill vs bare table — record scores
- [x] `dogfood/2026-10-20/compare-note.md` — one section linking to `../eval/` — discoverability

**Acceptance Criteria:**
- Given `dogfood/eval/`, when a stranger opens README + rubric + sample, then they can score Skill vs bare without inventing a new sample.
- Given the rubric, when applied to the four dimensions named in Intent, then each has clear Pass/Fail evidence rules including 04 四要素.
- Given compare-note, when read, then it points at the eval harness path.
- Given Skill/extension trees, when grepped for this story, then they were not modified.

## Implementation Notes

- 2026-10-21: Added `dogfood/eval/` (README, rubric, scoresheet.template, sample.json identical to 2026-10-20). compare-note links to `../eval/`. skills/ + extension/ untouched.
- Mental score of dated outs: Skill Pass 降级/依据/四块, Fail 04（缺可粘贴标题与约150字开头写法）; bare Fail 降级/四块/04, 依据可 Pass（有标题锚点）。README documents re-run for fresh 04.
- 2026-10-21 review patches: install pointer; rubric dim4 labeled-elements Fail; no Partial; compare-note dated Fail note; README wording fixes.

## Plan Change Log

## Review Triage Log

- 2026-10-21 quick: 6 findings → all patch; 0 defer; re-verified.
- medium, patch — README Skill install had no entry → link root README + npx example + `_shared`.
- low, patch — 「上表四维」 dangling → point at `rubric.md`.
- medium, patch — dim4 开头写法 could absorb buried 150-字约束 → Fail unless labeled elements.
- low, patch — dated skill-out「可能缺」→ confirmed 缺少.
- low, patch — Partial wording removed from rubric expectation table.
- medium, patch — compare-note glance vs eval dim4 Fail noted for dated skill-out.

## Design Notes

**Pass/Fail (not 0–5):** Keeps stranger scoring fast. Optional notes column for quotes.

**Dated skill-out:** Pre-5.2 `skill-out.md` may Fail 可粘贴标题 / 约 150 字 — README must say “re-run Skill for fresh score” while still using it to illustrate 降级+四块 contrast vs bare.

**Minimal rubric rows:**
1. 降级 — `<10`/8 篇须有「不做个人史排序」(or equivalent literal)
2. 依据 — ≥1 factor with row id / title / quote
3. 四块 — headings `## 01 结论` … `## 04 实验` in order
4. 04 可发 — 可粘贴标题 + 开头写法（约 150 字）+ 只改一个变量 + 发后回灌

## Verification

**Commands:**
- `test -f dogfood/eval/README.md && test -f dogfood/eval/rubric.md && test -f dogfood/eval/sample.json && test -f dogfood/eval/scoresheet.template.md` -- expected: all exist
- `python3 -c "import json; a=json.load(open('dogfood/eval/sample.json'))['articles']; assert len(a)==8"` -- expected: exit 0
- `rg -n 'dogfood/eval|rubric|不做个人史排序|可粘贴标题' dogfood/eval dogfood/2026-10-20/compare-note.md` -- expected: hits
- `rg -L . skills/gzh-review/SKILL.md extension/src/content-list.ts 2>/dev/null; true` — do not require change; confirm story did not edit them via `git`/`diff` if available, else spot-check mtimes unchanged vs intent

**Manual checks:**
- Mentally score `skill-out.md` vs `bare-out.md` with rubric; Skill wins 降级+四块; 04 may Fail on dated skill-out — README documents that.
