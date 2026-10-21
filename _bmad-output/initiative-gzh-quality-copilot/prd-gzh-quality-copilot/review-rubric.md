# PRD Quality Review — GZH Quality Copilot（公众号质量 Copilot）

## Overall verdict
This PRD holds up as a coherent launch-oss contract: the evidence-loop thesis drives UJs, FRs, launch blockers, and counter-metrics, and the FR-5 extension gate plus Brief/PRFAQ conflict table read as real decisions rather than smoothed consensus. What is at risk is implementability at the edges — a few content-shaped FRs stay soft for LLM output, Addendum A still frames the extension as optional (undercutting FR-5), and LICENSE remains open for an OSS first tag. Fix those and the document is green-light capable; leave them and Spec/Ticket agents will invent the missing bounds.

## Decision-readiness — adequate

Trade-offs are named, not balanced into mush. §1 Vision and §5 Non-Goals explicitly refuse 推流破解 / 保证爆款 / 代发 / SaaS; §2.2 Non-Users absorb the obvious pushback personas. FR-5 states a dated **决策** that the first public tag must ship a usable export extension, with paste as permanent post-launch degradation — and Open Question 3 is struck through as resolved. Addendum §D’s Brief vs PRFAQ table makes the same call visible as a conflict resolution, not a buried consideration. Open Questions 1–2, 4–5 are actually open (brand, LICENSE, Skill packaging, 90-day metric form), not rhetorical.

For **launch-oss** stakes, adequate not strong: you cannot ship a public OSS tag without a chosen LICENSE, and that item is still deferred to “最佳实践调研” (§8 #2, §9). SM-5’s quantitative bar is likewise deferred. Decision honesty is high; launch-blocking closure is incomplete.

### Findings
- **high** LICENSE still open at launch-oss stakes (§8 #2, §9) — First public tag legally needs a license; leaving it as ASSUMPTION is honest but not decision-complete. *Fix:* Pick MIT (or another SPDX id) before tag, or elevate to an explicit launch blocker next to FR-5.
- **medium** FR-5 allows “维护者签字的当周冒烟记录” as substitute for live export success (§4.2 FR-5 Consequences) — Soft escape hatch for the hardest launch gate. *Fix:* Require reproducible smoke (fixture account + recorded steps) or define sign-off expiry/owner in one sentence.

## Substance over theater — strong

Vision (§1) is product-specific: the missing middle between 导出表格 / 标题公式 / 进草稿箱 and a self-evidence loop. Swap the category and it breaks — not Vision theater. Three UJs (§2.3) each force a product rule (林修 → paste edge; 阿宁 → count degradation honesty; 陌生作者 → zero-code demo); none are decorative fourth personas. Differentiation (Addendum §F “自有证据闭环”) matches research-shaped gaps rather than claimed novelty. NFRs are mostly absences of fluff: no “must be scalable/secure/reliable” boilerplate; honesty constraints are operationalized in FR-2/6/11. SM-C1/SM-C2 actively reject vanity theater (reads, extension install rate).

No findings that add information beyond the judgment.

## Strategic coherence — strong

Thesis is explicit: relative review → structure对照 → verifiable experiments → re-measure, without algorithm claims (§1, Glossary “相对复盘” / “实验”). Feature groups §4.1–4.5 follow that arc; launch blockers (FR-2, FR-5, FR-6, FR-8, FR-11 in §6.1) are trust/honesty + input-path gates that serve the thesis, not “easy first.” Success Metrics validate the bet: SM-1 external reproduction, SM-2 Skill vs 裸聊 stability of degradation/evidence/four-block, SM-3 dogfood vertical cut; counters SM-C1/C2 name what not to optimize. MVP kind is problem-solving (quality decision loop), and Out of Scope (§6.2) keeps platform/revenue expansion in Later without muddying v1.

No findings required.

## Done-ness clarity — adequate

Most FRs carry testable Consequences. FR-6’s count table is exemplary; FR-2’s permission checklist is checklist-verifiable; FR-4/13 demo path is binary. LLM-shaped outputs are partly bounded by FR-11 (依据片段) and FR-12 (四块骨架). Remaining softness: several FRs assert “获得 X” without a minimum shape of X, which Spec agents will pad.

### Findings
- **high** FR-7 relative-review content shape under-specified (§4.3 FR-7) — Consequences only require belonging to 结论/因子 blocks and not claiming algorithm causality; an engineer cannot tell a pass from a vague chat summary. *Fix:* Add 1–2 mandatory fields per applicable档 (e.g. ≥N ranked items or coarse bands with named comparison basis).
- **medium** FR-9 “结构拆解” unbounded (§4.4 FR-9) — No required dimensions or output skeleton (Addendum §E lists candidates but PRD does not bind them). *Fix:* Point FR-9 Consequences at a min subset of §E dimensions, or a fixed heading list in the Skill.
- **medium** FR-10 “开头/结构方向” and “尽量单变量” soft (§4.4 FR-10) — Title count (≥3) and experiment count (1–3) are testable; “方向” and “尽量” are not. *Fix:* Require each experiment to name the single changed variable + how post-publish 本号数据 would falsify it.
- **low** FR-12 “等价固定骨架” weasel (§4.4 FR-12) — Allows renaming away from 结论/因子/候选/实验 without a synonym list. *Fix:* Mandate Glossary “输出四块” labels or an explicit allowed alias table.

## Scope honesty — adequate

§5 Non-Goals, §2.2 Non-Users, §6.2 Out of Scope, and §6.3 gate sequence do real work; paste vs extension is not silently assumed. `[ASSUMPTION]` tags appear inline (title, FR-1, FR-14) and in §9; resolved items are marked **已决**. Open-item density is appropriate for draft launch-oss *if* LICENSE is closed soon; brand/Skill-split/90-day form can stay open without blocking build. Missing `[NOTE FOR PM]` callouts is stylistic — tensions live in Open Questions and dated 决策 instead.

### Findings
- **high** Addendum A contradicts FR-5 on extension optionality (addendum.md §A vs PRD §4.2 FR-5 / §6.1) — Skeleton comment says `extension/  # 可选；尽力维护` while PRD makes a usable extension a first-tag hard gate. Downstream readers of the addendum alone will re-litigate MVP. *Fix:* Change §A to “首发必含；失效应急靠粘贴” (or equivalent) to match FR-5 / §D.
- **medium** Open-items density vs stakes (§8–§9) — Four open questions + multiple ASSUMPTIONs on a launch-oss PRD; LICENSE and first-tag definition are the only ones that block shipping. *Fix:* Split “blocks tag” vs “can defer post-tag” in §8 explicitly.
- **low** No `[NOTE FOR PM]` at remaining tensions (§8) — Rubric expects PM callouts at unresolved stakes; Open Questions partially substitute. *Fix:* Optional — tag LICENSE / SM-5 rows with `[NOTE FOR PM]` if the team uses that convention downstream.

## Downstream usability — adequate

Document Purpose (§0) correctly targets Spec/Ticket/实现 Agent. Glossary (§3) is load-bearing and mostly reused identically in FRs/UJs/SMs. FR-1…FR-14, UJ-1…3, SM-1…5 / SM-C1…C2 are contiguous and cross-refs (“Realizes UJ-…”, “Validates FR-…”) resolve. Each UJ names a protagonist with inline context. Chain-top shape is intentional; this dimension matters and is mostly met. Gaps are vocabulary that appear in Consequences but not Glossary, plus the addendum/PRD extension wording drift already filed under Scope honesty.

### Findings
- **medium** “夹具 / 夹具数据” used but undefined (§4.3 FR-6, §4.4 FR-11 Consequences) — Implementers need to know whether this means `examples/` CSV, a test fixture path, or any pasted sample. *Fix:* Add Glossary entry pointing at `examples/` (or test harness) as the verification corpus.
- **low** “结构教练” in FR-3 / UJ-2 not glossed (§4.1 FR-3, §2.3 UJ-2) — Informal synonym for &lt;10 / low-count mode; mild drift from “篇数降级”. *Fix:* One Glossary line aliasing 结构教练 → FR-6 &lt;10 behavior, or drop the metaphor in FR text.
- **low** Mixed EN/CN launch vocabulary (§6.1 “Launch blockers”, §6.3) — Fine for bilingual maintainers; Spec extraction may treat as separate concepts. *Fix:* Prefer one term (e.g. 发版门闩) with EN in parentheses once.

## Shape fit — strong

Product is a multi-author OSS Agent Skill + optional browser extension with meaningful install/report UX — not a single-operator internal tool. Three UJs with named protagonists are load-bearing (experienced dogfood, low-count honesty, stranger zero-code), not over-formalized. Capability FRs + operational SMs fit an OSS launch better than consumer engagement metrics. Mechanism, input schema draft, five-client install detail, and competitor categories correctly live in `addendum.md`, keeping the PRD narrative lean. Greenfield OSS: no brownfield code-reference debt. Shape matches stakes and Document Purpose.

No findings required.

## Mechanical notes

- **Glossary drift:** “输出四块” ↔ “结论 / 因子 / 候选 / 实验” consistent; “结构教练” and “夹具” appear outside Glossary (see Downstream). “在看” appears in Glossary via 本号数据 examples and Addendum §B `wow_count` — aligned enough.
- **ID continuity:** FR-1–14, UJ-1–3, SM-1–5, SM-C1–C2 contiguous; no duplicates. Cross-refs to UJs/FRs resolve. Open Question 3 resolved in-place (strikethrough) — fine.
- **Assumptions Index roundtrip:** Inline ASSUMPTIONs (title line, FR-1, FR-14) appear in §9. §9 also lists 短篇唯一赛道 / Skill 拆分 without matching inline `[ASSUMPTION]` tags in the body (content implied by FR-8 / Open Question 4) — minor incomplete roundtrip. **已决** extension item in §9 has no ASSUMPTION tag (correct).
- **UJ protagonists:** UJ-1 林修, UJ-2 阿宁, UJ-3 陌生作者 — all named with context.
- **Required sections for launch-oss:** Vision, Users/UJs, Glossary, FRs, Non-Goals, MVP, Success Metrics (+ counters), Open Questions, Assumptions Index present; addendum covers mechanism. Adequate set.
- **Addendum/PRD conflict:** §A `extension/` “可选” vs FR-5 hard gate — must reconcile (filed above).
