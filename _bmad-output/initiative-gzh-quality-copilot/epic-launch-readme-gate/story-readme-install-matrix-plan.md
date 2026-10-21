---
title: 'README install matrix'
type: 'feature'
ticket: '1'
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

**Problem:** README 安装 is still a placeholder; a stranger cannot install the Skill on a named Agent without inventing steps.

**Approach:** Replace that section with five Agent entries (Cursor, Claude Code, Codex, WorkBuddy, OpenClaw). Prefer one copy-paste command each from the repo root using `npx skills add . --skill gzh-review -a <agent>`; where the Agent has no reliable `-a` path, give a one-line pointer to its skill-install docs and keep Cursor as the worked example. Keep 预期对齐 and 演示 links intact (polish only if wording drifts).

</frozen-after-approval>

## Implementation Notes

- Replaced README 安装 with five Agent subsections; Cursor is the full worked `npx skills add . --skill gzh-review -a cursor -y` example.
- Claude Code / Codex / OpenClaw: same CLI pattern where `-a` is documented; OpenClaw also documents `openclaw skills install ./skills/gzh-review`.
- WorkBuddy: no trustworthy one-liner for this repo yet → pointer to WorkBuddy docs + copy path; points to Cursor example (Decision-aligned).
- Left 预期对齐 / 演示 / 权限占位 untouched (later tickets).
- Repo has no public remote yet → install assumes local clone / open root (`.`).
- Quick-review patches: document `_shared` sibling requirement; WorkBuddy → SkillHub / `~/.workbuddy/skills/`; Cursor trigger words from SKILL.md; drop unverified OpenClaw `-a openclaw`.

## Plan Change Log

## Review Triage Log

- `_shared` missing after skill-only install → medium, patch: README intro + per-Agent copy notes.
- WorkBuddy doc pointer vs addendum → medium, patch: SkillHub + `~/.workbuddy/skills/`.
- 「用金样复盘」not in SKILL triggers → low, patch: 「复盘」「本号数据」.
- OpenClaw `-a openclaw` unverified → low, patch: remove; keep `openclaw skills install` + future git form.

## Verification

**Commands:**
- `rg -n '占位：复制即装|Cursor|Claude Code|Codex|WorkBuddy|OpenClaw|gzh-review|articles.interchange|sample-report' README.md` -- expected: no 安装占位; five Agent names; skill + demo links present
- `rg -n '有历史篇数' README.md` -- expected: 预期对齐 sentence remains

**Manual checks (if no CLI):**
- A stranger can follow the Cursor command from repo root without inventing steps.
