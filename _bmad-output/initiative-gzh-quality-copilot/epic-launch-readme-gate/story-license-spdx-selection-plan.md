---
title: 'LICENSE SPDX selection'
type: 'feature'
ticket: '5'
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

**Problem:** Root `LICENSE` is a stub that refuses public tags; SPDX was decided MIT (2026-10-20) but the grant text is not in the file yet.

**Approach:** Replace the stub with standard MIT license text (SPDX-License-Identifier: MIT). Update README 贡献 / License so it no longer says SPDX is unchosen / 占位. No other SPDX options.

</frozen-after-approval>

## Implementation Notes

Oneshot: LICENSE + short README polish.
- Decision: Copyright (c) 2026 GZH Quality Copilot contributors (user chose option 1).
- Replaced LICENSE stub with standard MIT text; README 贡献节 now says MIT, no 占位.

## Plan Change Log

## Review Triage Log

- quick (2026-10-20): no findings.

## Verification

**Commands:**
- `rg -n 'SPDX identifier is not chosen|MIT|Permission is hereby granted|占位' LICENSE README.md` -- expected: LICENSE is MIT grant; no stub language; README no longer says SPDX 占位
- `rg -n 'Copyright \\(c\\)' LICENSE` -- expected: one copyright line present

**Manual checks (if no CLI):**
- LICENSE reads as OSI MIT; stranger sees README point at a real license.
