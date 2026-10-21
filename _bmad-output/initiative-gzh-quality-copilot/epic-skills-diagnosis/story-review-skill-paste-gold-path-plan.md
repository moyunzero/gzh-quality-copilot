---
title: 'Review Skill paste gold path'
type: 'feature'
ticket: '1'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Authors cannot yet run a review Skill on pasted or file interchange data; contracts and gold JSON exist but no Skill package cites them.

**Approach:** Add `skills/gzh-review/SKILL.md` that cites `skills/_shared/contracts.md` (no private degradation table), accepts paste or file (JSON and CSV), and on the 3-article gold fixture produces a four-block &lt;10 report: no personal ranking, ≥3 candidates, 1 structure experiment plus re-ingest hint, at least one evidence snippet.

</frozen-after-approval>

## Implementation Notes

Oneshot: one Skill markdown file, well under 100 LOC. Other bands and benchmark-paste are later tickets.

- Wrote `skills/gzh-review/SKILL.md`: cites contracts.md; JSON/CSV sniff; &lt;10 rules; four headings; evidence AND 推测; ≥3 candidates; one experiment + 回灌.
- Did not fork the degradation table. Did not add mid/high fixtures (2.3) or benchmark paste (2.4).
- hitl: 2026-10-20 本会话按 SKILL.md 对 `examples/articles.interchange.json` 跑通四块（见对话输出）。
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- medium, patch — Skill said obey full contracts.md, whose &lt;10 row includes 对标粘贴 (2.4). Added: no-benchmark-paste this run; still emit four blocks.

## Verification

**Commands:**
- `rg -n 'contracts.md|不做个人史排序|## 01 结论|## 04 实验|【推测】|回灌' skills/gzh-review/SKILL.md` -- expected: cite + headings + badges + re-ingest

**Manual checks (if no CLI):**
- hitl: run the Skill in Agent on `examples/articles.interchange.json`; four blocks, no ranking, ≥3 candidates, re-ingest, ≥1 evidence snippet.
