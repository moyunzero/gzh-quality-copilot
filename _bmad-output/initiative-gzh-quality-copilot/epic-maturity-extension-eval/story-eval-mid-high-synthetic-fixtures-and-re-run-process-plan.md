---
title: 'Eval mid/high synthetic fixtures and re-run process'
type: 'feature'
ticket: '3'
created: '2026-10-22'
status: done
baseline_revision: '1803324ba1ca1bfc0ca2ec2f0b0074727a13d602'
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

**Problem:** Eval harness only pins an 8-article (`<10`) `sample.json`, so strangers cannot score Skill vs 裸聊 on mid (10–29) or high (≥30) bands without inventing corpus; re-run-after-Skill-change and report self-check are undocumented.

**Approach:** Add two synthetic fixtures under `dogfood/eval/` derived only from `sample.json` (15 mid / 30 high), and extend that README with per-band scoring notes, when to re-run after Skill/contract changes, and an optional report self-check list. Keep contracts band cutoffs and the four rubric dimensions; only clarify band-conditional Pass wording for dimension 1.

## Boundaries & Constraints

**Always:** Fixtures are synthetic derivatives of `dogfood/eval/sample.json` only; keep interchange-shaped rows (`title`, `publish_time`, counts, `url`, `body`, `article_id`); README tells a stranger how to score each band with the same A/B/C protocol; leave `skills/_shared/contracts.md` band table numbers unchanged; leave privacy/extension out of this ticket.

**Never:** Copy or commit `dogfood/private/` dumps; replace or delete the pinned 8-row `sample.json`; change contracts thresholds or add/remove rubric dimensions; invent a new weighted score system; touch Skill product rules beyond documenting re-run; depend on `examples/articles.band-*.json` as the eval source of truth (those remain Skill demos).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mid fixture count | `sample-mid.json` | Exactly 15 articles; all rows carry unique `article_id`; `_source` notes synthesis from `sample.json` | Fail verify script if out of 10–29 |
| High fixture count | `sample-high.json` | Exactly 30 articles; unique ids; same schema | Fail verify if `<30` |
| Score mid/high dim 1 | README + rubric band note | Mid Pass = coarse 稍好/普通/较差 (no fine percentiles); High Pass = relative rank allowed; declaring「不做个人史排序」on mid/high is Fail for Skill path | Bare path still scored honestly |
| Re-run trigger | Skill or contracts behavior change | README lists when to re-run A/B and archive dated outputs; do not mutate pinned fixtures | N/A |
| Self-check | Optional list in README | Checklist covers 降级档声明 / 四块 / 04 四要素 / sf-* when ≥10 | Optional — not a gate |

</frozen-after-approval>

## Code Map

- `dogfood/eval/sample.json` — Seed only (8 rows, `<10`). **Do not rewrite** article bodies/titles for CAP-3; clone/vary into new files.
- `dogfood/eval/sample-mid.json` / `sample-high.json` — **Create.** Synthesize by cycling seed rows with new `article_id` (`M01…` / `H01…`), title suffix or light paraphrase marker, shifted `publish_time`, varied `read_count` so ranking signals exist; keep `body` from seed (truncate clones only if file size is painful).
- `dogfood/eval/README.md` — Today documents only 8-row Quick Start. **Extend:** table of fixtures by band; how to point A/B at mid/high; dim-1 expectations per band; 「改 Skill/契约后何时重跑」; optional report self-check bullets. Keep existing 2026-10-20 / 2026-10-21 dated-run sections.
- `dogfood/eval/rubric.md` — Keep four dimensions. **Clarify** dimension 1 Pass so it is band-conditional ( `<10` → 不做个人史排序; `10–29` → 粗分三档且不做细分位; `≥30` → 允许相对排序). Do not add a 5th dimension.
- `dogfood/eval/scoresheet.template.md` — Optional one-line note that fixture path/band must be recorded; no schema redesign.
- `skills/_shared/contracts.md` — **Verify unchanged** band rows (`≥30` / `10–29` / `<10`).
- Continuity — Epic CAP-3 / ticket 6.3; Skill already teaches mid/high via `examples/articles.band-*.json` (leave those alone). Prior story 6.2 plan is extension-only; no code reuse required.

## Tasks & Acceptance

**Execution:**
- [x] `dogfood/eval/sample-mid.json` -- Synthesize 15 articles from `sample.json` with unique ids + metadata `_source` / `_band`.
- [x] `dogfood/eval/sample-high.json` -- Synthesize 30 articles the same way.
- [x] `dogfood/eval/README.md` -- Document mid/high fixtures, per-band scoring, re-run-after-change, optional self-check; keep `<10` Quick Start.
- [x] `dogfood/eval/rubric.md` -- Band-conditional Pass text for dimension 1 only; dimensions stay four.
- [x] `dogfood/eval/scoresheet.template.md` -- Record fixture/band field if missing.
- [x] Verify -- Assert JSON counts in-band and `contracts.md` band lines unchanged (`rg` / python).

**Acceptance Criteria:**
- Given `dogfood/eval/`, when listing fixtures, then `sample-mid.json` has 10–29 rows and `sample-high.json` has ≥30 rows, both derived from `sample.json` (not private).
- Given README, when a stranger opens it, then they can score mid and high with the A/B/C protocol and know when to re-run after Skill/contract changes, plus find an optional self-check list.
- Given `skills/_shared/contracts.md`, when inspected after the change, then the ≥30 / 10–29 / `<10` cutoff rows are byte-stable vs baseline.
- Given `rubric.md`, when inspected, then there are still exactly four scoring dimensions.

## Implementation Notes

- Built mid=15 / high=30 synthetic fixtures from `sample.json`; README + rubric + scoresheet updated; contracts untouched.
- Quick review: 3 patches applied (fixture table in rubric, ≥30 dim-1 Fail alignment, sf-* self-check item); fixed broken markdown blank line in rubric dim table.

## Plan Change Log

## Review Triage Log

- 2026-10-22 quick — findings: 3. verdicts high/medium/low/false/maybe-false: 0/2/1/0/0.
  - medium, patch — `rubric.md` opener says「见下方分档」but no fixture table follows; evidence: file has only dim table + 快速对照 after opener.
  - medium, patch — dim-1 Fail「无降级声明」conflicts with ≥30 Pass that only requires relative ranking allowed; evidence: Pass/Fail cells vs contracts ≥30 behavior + plan I/O High Pass.
  - low, patch — README optional self-check buries sf-* inside 锚点 and does not state ≥10 should check substantive sf-*; evidence: 自检清单 vs matrix「sf-* when ≥10」.

## Design Notes

Synthesis recipe (keep deterministic): for target N, cycle the 8 seed articles; set `article_id` to `M{nn}` / `H{nn}`; append ` ·合成{nn}` to title only on clones (seed row 1..8 keep original titles once); bump `publish_time` by `nn` days; scale `read_count` with a small deterministic spread so mid/high Skill paths have contrast. Meta: `"_source": "synthetic from dogfood/eval/sample.json for CAP-3"`, `"_band": "10-29"|"≥30"`.

Do not symlink or copy `examples/articles.band-*.json` into eval — different provenance and no `article_id`.

## Verification

**Commands:**
- `python3 -c "import json; from pathlib import Path; e=Path('dogfood/eval'); m=json.loads((e/'sample-mid.json').read_text())['articles']; h=json.loads((e/'sample-high.json').read_text())['articles']; assert 10<=len(m)<=29 and len(h)>=30; assert len({a['article_id'] for a in m})==len(m); assert len({a['article_id'] for a in h})==len(h); print(len(m), len(h))"` -- expected: prints `15 30` (or chosen in-band counts)
- `git diff HEAD -- skills/_shared/contracts.md` -- expected: empty (no band cutoff edits)
- `rg -n '^\\| [1234] \\|' dogfood/eval/rubric.md` -- expected: four dimension rows remain

**Manual checks:**
- README has mid/high fixture names, re-run section, optional self-check; Quick Start for 8-row sample still works.
