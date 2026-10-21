---
id: SPEC-maturity-post-mvp
companions:
  - ../ux-gzh-quality-copilot/EXPERIENCE.md
  - ../deferred-work.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Post-MVP maturity (extension + eval)

## Why

**Pain to solve + mandate to meet.** MVP (epics 1–5 + walkthrough) ships, but deferred rows leave the extension below EXPERIENCE’s “状态 → 导出” IA and leave exports capped to the current list page; the eval harness still proves shape only on a single &lt;10 sample. Closing these gaps makes the public tool honest for multi-page authors and makes Skill changes re-checkable across degradation bands—without reopening growth/SEO scope.

## Capabilities

- **CAP-1**
  - **intent:** Author can see, before clicking 导出, whether the current tab looks like a logged-in own-account published-list context.
  - **success:** Popup shows a readable pre-export status (ok / not-list / not-logged-in or equivalent); status does not require clicking 导出 to appear.

- **CAP-2**
  - **intent:** Author can optionally export published-list rows beyond the single page currently on screen, until pages end or the user cancels, with a clear stop reason.
  - **success:** Multi-page walk runs only when the user checks an opt-in control; mid-run 取消 stops pagination; on a multi-page account, opt-in export yields more rows than current-page-only of page one; current-page-only remains the default when opt-in is unchecked.

- **CAP-3**
  - **intent:** A stranger can run Skill vs 裸聊 scoring on fixed synthetic fixtures for mid (10–29) and high (≥30) bands, and knows when to re-run after Skill/contract changes.
  - **success:** `dogfood/eval/` documents and ships mid + high fixtures synthesized from `sample.json` (not `dogfood/private/`); README covers re-run-after-change process and an optional report self-check list; rubric thresholds/band numbers in contracts stay unchanged.

## Constraints

- Privacy and permission freeze stay: own-account only; no project cloud account; no competitor scrape; popup/README permission lists match `extension/manifest.json`.
- Do not change Skill degradation band cutoffs or Pass/Fail rubric dimensions in this epic—fixtures and process only.
- Auto-pagination must not remove or hide paste-first / current-page export paths required for UJ-1 first run.
- CAP-2 UX: multi-page walk only when user checks opt-in; cancel control must stop in-flight pagination.
- CAP-3 fixtures are synthetic derivatives of `dogfood/eval/sample.json`; never commit private dumps into eval.
- Build order: CAP-1 → CAP-2 → CAP-3.
- Keep changes surgical: extension popup + extract path for CAP-1/2; eval docs/fixtures for CAP-3.

## Non-goals

- Baidu / further SEO landing work; custom domain; OG art.
- Title-generation product, account hosting, or algorithm “guarantee” features.
- Changing `contracts.md` band thresholds or inventing a new weighted insight rubric.
- Auto-page that scrapes non-list surfaces or other accounts.

## Success signal

Maintainer demo: (1) popup status correct on list vs non-list tab without export click; (2) unchecked export = current page only; checked + cancel works; checked to completion on multi-page dogfood yields more rows than page one alone; (3) stranger instructions exist to score mid and high synthetic fixtures under the existing rubric without inventing corpus.

## Assumptions

- Work stays under `initiative-gzh-quality-copilot` as the next epic after `epic-quality-depth`.
- EXPERIENCE IA line “状态（已登录本号？）→ 导出” is the UX source of truth for CAP-1 wording, not a redesign of the whole popup.
