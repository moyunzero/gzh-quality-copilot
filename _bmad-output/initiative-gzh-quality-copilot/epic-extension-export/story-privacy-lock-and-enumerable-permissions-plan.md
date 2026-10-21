---
title: 'Privacy lock and enumerable permissions'
type: 'feature'
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

**Problem:** Manifest permissions are live but not locked as the README copy source; regressions could widen hosts or add forbidden behaviors without a check.

**Approach:** Pin `permissions` and `host_permissions` in `extension/manifest.json` as the sole enumerable freeze; keep popup 会做/不会做 aligned with that freeze and real code; add a regression test that asserts the freeze verbatim and greps extension sources for upload / proxy-login / publish-to-server / Skill paths. Do not rewrite README privacy body (launch epic).

</frozen-after-approval>

## Implementation Notes

- Frozen arrays pinned in `extension/test/privacy-lock.test.mjs` to match `manifest.json` (no invalid JSON comments).
- `popup.html` 会做 now lists the freeze verbatim; 不会做 adds Skill ban.
- README privacy body left as launch-epic placeholder (AD-7 copy happens there).

## Plan Change Log

## Review Triage Log

- medium, patch — deny-list missed broad `upload` / publish-to-server; added.
- medium, patch — freeze did not reject optional_* or extra content_scripts; asserted length===1 and no optional keys.
- low, patch — popup listed tabs before downloads; now matches freeze order.
- medium, patch — Skill ban assert matched paste-help; now scoped to 不会做 block.
- low, patch — 「主机仅」vs Google Fonts; wording now 「页面访问主机」+ CDN 除外.

## Verification

**Commands:**
- `cd extension && npm test` -- expected: privacy-lock tests pass
- `python3 -c "import json; m=json.load(open('extension/manifest.json')); assert m['permissions']==['downloads','tabs']; assert m['host_permissions']==['https://mp.weixin.qq.com/*']"` -- expected: exit 0

**Manual checks (if no CLI):**
- Copy `permissions` + `host_permissions` from manifest; they should be the only host/permission lines README will later paste.
