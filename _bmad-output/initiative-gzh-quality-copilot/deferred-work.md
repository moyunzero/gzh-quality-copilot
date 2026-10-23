- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-extension-export/story-own-account-list-extract-plan.md`
  summary: Pre-export「已登录本号？」status — **closed by epic-6 CAP-1** (story 6.1).
  evidence: |
    Was open from epic-3 list extract. Landed: `tabExportContext` + popup `refreshContextStatus` on open (`f85784b` / story-pre-export-login-list-status-plan done).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-extension-export/story-own-account-list-extract-plan.md`
  summary: Auto-pagination / walk all list pages — **closed by epic-6 CAP-2** (story 6.2 opt-in + cancel).
  evidence: |
    Was open from epic-3. Landed: opt-in「翻完所有页」+ SW `begin=` URL walk + cancel (`ee1a244`…`6856bff` / story-opt-in-multi-page-export done). HITL 16-page account downloaded JSON.

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-extension-export/story-refactor-sweep-plan.md`
  summary: Epic-3 refactor sweep (3.4) explicitly dropped landing the two deferred items above; no code change.
  evidence: Ticket 3.4 forbids new product scope. Login-status + auto-pagination stay deferred for a later epic; 3.1–3.3 review patches already in-tree; extension sources have no TODO/FIXME.

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-launch-readme-gate/story-refactor-sweep-plan.md`
  summary: Epic-4 refactor sweep (4.6) found no leftover review debt from 4.1–4.5; no code/docs patch.
  evidence: All 4.1 patches already in README; 4.2–4.5 quick reviews reported no findings; no epic-4 entries previously in deferred-work; README/LICENSE/LAUNCH-GATES have no 占位/TODO/FIXME. Ticket forbids new product scope; epic-3 login-status + auto-pagination remain deferred above.

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-quality-depth/story-refactor-sweep-plan.md`
  summary: Epic-5 refactor sweep (5.4) — no product code change; cleared stale 5.1 HITL-pending plan prose (HITL already passed same day).
  evidence: |
    5.1–5.3 quick reviews: code findings patched in-tree. Stale 5.1 Notes/Triage said HITL re-export still deferred; dogfood 2026-10-20 already recorded 5.1 HITL pass — sweep rewrote those lines + aligned 5.1 permissions assert with `scripting` freeze.
    Product trees: no TODO/FIXME/后续票; `npm test` 33 pass. Explicitly dropped (out of epic-5): login-status UI + auto-pagination (epic-3 rows above).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-author-true-path/walkthrough-author-true-path.md`
  summary: README（或金样旁）注明：扩展导出故意无 body、_missing 含 body 属正常；金样/eval 可含 body 仅供粘贴演示。
  evidence: |
    Walkthrough Slice B Thoughts: gold+eval have body; normalize always strips body. User deferred doc one-liner until after walkthrough (with login UI / auto-page maturity work).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-author-true-path/walkthrough-author-true-path.md`
  summary: 加厚 eval 闸门（分档夹具 / 自检 / 重跑约定）— **closed by epic-6 CAP-3** (story 6.3).
  evidence: |
    Was open from author-true-path Slice D. Landed: `dogfood/eval/sample-mid.json` (15) + `sample-high.json` (30); README 分档/重跑/自检; rubric dim-1 band-conditional (`c623bce` / story-eval-mid-high done).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-author-true-path/walkthrough-author-true-path.md`
  summary: README body/_missing 旁注已落地（2026-10-21 README 重写）；本条关闭 walkthrough 所 defer 的文档债。
  evidence: Root README「关于 body」小节；金样可含 body、扩展导出 _missing 含 body 已写明。

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-maturity-extension-eval/story-opt-in-multi-page-export-with-cancel-plan.md`
  summary: Unused `fixtures/list-page-pager.html` — **dropped in epic-6 sweep (6.4)**; unit mocks cover pager heuristics; live WeUI remains HITL.
  evidence: |
    6.2 quick review parked DOM fixture wiring. 6.4 deleted unused fixture (no test/import references); `pagination.test.mjs` mocks remain.

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-epic-6-maturity/walkthrough-epic-6-maturity.md`
  summary: Add dated Skill vs 裸聊 scored runs for mid (`sample-mid.json`) and high (`sample-high.json`) under a new dogfood/YYYY-MM-DD/ folder.
  evidence: |
    Walkthrough Broad strokes / Slice C Thoughts: fixtures+README exist; only <10 dated sample is 2026-10-21. User deferred during walkthrough (先记着). **Explicitly out of 6.4** (no new product scope).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-epic-6-maturity/walkthrough-epic-6-maturity.md`
  summary: Deduplicate multi-page export near-duplicates (truncated title + tempkey vs full /s/ URL) and strip「已修改…」title suffixes.
  evidence: |
    HITL JSON after 6.2 begin= walk showed pairs; user chose commit 6.2 first (option B), then walkthrough deferred. **Explicitly out of 6.4** (no new product scope).

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-maturity-extension-eval/story-refactor-sweep-plan.md`
  summary: Epic-6 refactor sweep (6.4) — closed CAP-1/2/3 deferred rows with evidence; dropped unused pager fixture; no new CAP coverage.
  evidence: |
    Closed/rewrote: epic-3 login-status + auto-pagination; author-true-path eval thicken. Dropped: list-page-pager.html. Left open (product later): mid/high dated runs + export title cleanup. `npm test` green; no TODO/FIXME in extension/src or dogfood/eval.

## Deferred from: code review of story-opt-in-multi-page-export-with-cancel-plan (2026-10-22)

- Pager `totalPagesFromPagerText` may underestimate when WeUI omits last page numeral — maybe-false medium; settle with HITL/screenshot of ellipsis pager where last page is not in DOM (`extension/src/logic.ts`).
- Large multi-page `data:` download may hit browser URL size limits — maybe-false medium; settle by exporting near MULTI_PAGE_CAP and checking `chrome.downloads.download` reject (`extension/src/background.ts`).

## Deferred from: code review of story-opt-in-multi-page-export-with-cancel-plan (2026-10-22 re-review)

- `waitTabNavigateComplete` may resolve on stray `complete` (user navigates other URL mid-export) — maybe-false medium; settle by HITL navigating away mid-export or asserting URL match after complete (`extension/src/background.ts`).
