---
title: 'Mid/high count-band fixtures and rules'
type: 'chore'
ticket: '3'
created: '2026-10-20'
status: done
baseline_revision: 'NO_VCS'
route: 'oneshot'
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

**Problem:** The review Skill only specifies the &lt;10 gold path; FR-6/FR-7 mid/high bands and 几乎无稿 have no fixtures or Skill rules.

**Approach:** Add synthetic interchange JSON for 10–29 and ≥30 (gold schema), extend `skills/gzh-review/SKILL.md` with those band rules plus an 几乎无稿 checklist (empty paste or 1 article), and check in a ≥30 sample report with ≥3 relative ranks, ≥2 named-evidence factors, and 【低置信】 where reads are tiny. No algorithm-causal claims. No private fork of the contracts table.

</frozen-after-approval>

## Implementation Notes

Oneshot: two fixture JSON files (generated), one sample report, and a small SKILL.md band section.

- `examples/articles.band-10-29.json` = 12 articles; `examples/articles.band-30.json` = 30 (3 higher reads, rest tiny).
- SKILL.md now states 几乎无稿 / &lt;10 / 10–29 / ≥30 and no-causal; still cites contracts.md only.
- `examples/sample-report-band-30.md`: 3-way relative rank, 2 evidence factors, 【低置信】.
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- medium, patch — sample-report said「个位数」but most ≥30 reads are teens; wording now matches JSON.
- medium, patch — factor #27 contrast claimed late object; #27 body leads with 钥匙. Switched contrast to #16.
- medium, patch — 几乎无稿 now requires literal「不做个人史排序」.

## Verification

**Commands:**
- `python3 -c "import json; a=json.load(open('examples/articles.band-10-29.json'))['articles']; b=json.load(open('examples/articles.band-30.json'))['articles']; assert 10<=len(a)<=29 and len(b)>=30; assert all('title' in x and 'read_count' in x for x in a+b); print(len(a),len(b))"` -- expected: counts in band
- `rg -n '10–29|≥30|几乎无稿|【低置信】|算法' skills/gzh-review/SKILL.md` -- expected: all present
- `rg -n '^## 01|^## 02|【低置信】' examples/sample-report-band-30.md` -- expected: headings + badge

**Manual checks (if no CLI):**
- ≥30 sample report has ≥3 relative ranks and ≥2 factors with named evidence.
