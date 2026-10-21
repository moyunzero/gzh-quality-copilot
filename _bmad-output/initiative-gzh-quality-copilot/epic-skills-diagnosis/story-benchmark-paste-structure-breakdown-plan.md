---
title: 'Benchmark-paste structure breakdown'
type: 'feature'
ticket: '4'
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

**Problem:** FR-9 needs an optional public-text paste for structure breakdown; the Skill still tells the agent not to ask for 对标 and does not mention `references/` fallback.

**Approach:** Extend `skills/gzh-review/SKILL.md` with optional author-pasted text (no URL fetch), three dimensions (hook / title / rhythm), the sentence 价值判断由作者定, and no-paste fallback to `references/`. Keep the four-block skeleton. Do not scrape competitor read counts.

</frozen-after-approval>

## Implementation Notes

Oneshot: one section added to existing SKILL.md.

- Added 「可选对标粘贴」: paste-only, three dimensions in 因子, 价值判断由作者定, fallback `references/`.
- Removed the 2.1 deferral line that blocked asking for 对标.
- Fetch/scrape remain forbidden (already on line 10; restated in the new section).
- VCS: none (`baseline_revision: NO_VCS`).


## Plan Change Log

## Review Triage Log

- (none) — quick lens: No findings.

## Verification

**Commands:**
- `rg -n '对标|价值判断由作者定|references/|开头钩子|fetch' skills/gzh-review/SKILL.md` -- expected: optional paste, three dimensions, author-judgment, fallback; fetch only as forbidden

**Manual checks (if no CLI):**
- SKILL.md: optional paste, three dimensions, 价值判断由作者定, references/ fallback, no scrape/fetch.
