- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-extension-export/story-own-account-list-extract-plan.md`
  summary: Popup lacks a pre-export「已登录本号？」status affordance from EXPERIENCE.md Information Architecture.
  evidence: 3.1 tracer and 3.2 list extract only surface status after click; EXPERIENCE wants login/own-account state before 导出. Not introduced by the list-extract change.

- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-extension-export/story-own-account-list-extract-plan.md`
  summary: Decide whether to add auto-pagination so 导出 walks every list page (not only the current one). Parked at backlog end — not in epic 3 remaining tickets.
  evidence: |
    HITL 2026-10-20: real export returned only the first page (~10 titles+urls); user asked if full-account auto-page is needed.
    UX note (park last): Skills degradation bands already work with partial samples (<10 / 10–29 / ≥30); paste remains first-class. Auto-page helps dogfood/full history but adds long wait, fragile paging DOM, and double-click/cancel UX. Prefer after 3.3 privacy lock + launch README; until then current-page + manual flip + paste is enough for UJ-1 first run.

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
  summary: 加厚 eval 闸门：分档夹具样本（10–29 / ≥30）、可选报告自检清单、改 Skill 后必重跑记分的流程约定（非本轮改 rubric）。
  evidence: |
    Walkthrough Slice D Thoughts: current harness is demo/discipline gate only; single 8-article sample; fully manual; shape not insight. User: done +「后续修改」.


- source_plan: `_bmad-output/initiative-gzh-quality-copilot/walkthrough-author-true-path/walkthrough-author-true-path.md`
  summary: README body/_missing 旁注已落地（2026-10-21 README 重写）；本条关闭 walkthrough 所 defer 的文档债。
  evidence: Root README「关于 body」小节；金样可含 body、扩展导出 _missing 含 body 已写明。


- source_plan: `_bmad-output/initiative-gzh-quality-copilot/epic-maturity-extension-eval/story-opt-in-multi-page-export-with-cancel-plan.md`
  summary: Wire `fixtures/list-page-pager.html` into a DOM-based pager test (or drop the unused fixture) once a lightweight HTML parser is acceptable in CI.
  evidence: 6.2 quick review — fixture added but tests mock walkListPages/findNext; live WeUI still HITL-only.
