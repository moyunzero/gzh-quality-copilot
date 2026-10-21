---
title: "PRFAQ Distillate: GZH Quality Copilot"
type: llm-distillate
source: "prfaq-gzh-quality-copilot.md"
created: "2026-10-20T02:37:20Z"
purpose: "Token-efficient context for downstream Spec/PRD"
---

# PRFAQ Distillate — gzh-quality-copilot

## Concept lock
- Open-source Agent Skills + optional own-account export extension; not hosted SaaS.
- Result framing **A**: intermediate gains (relative review + verifiable experiments); **never** promise WeChat recommendation slots or guaranteed virality.
- Primary user: serious 公众号 authors with little/no organic traffic who want to monetize via writing quality—not "everyone."
- Dogfood: short-fiction account; maintainer historical corpus cited as **60+ articles = case size only, not admission gate.**

## Rejected framings
- "Get more WeChat recommendations" as product promise → FAQ would collapse; user chose A.
- AI writer / one-click viral / "open-source 新榜" → wrong job, competitor collision.
- Public FAQ naming specific competitor repos → use category language; keep real names in research/brief only.
- Word「蒸馏」→ use「结构规律摘要」+ auditable `references/`.
- "Review our source code" as sole trust path for non-technical users → README permission checklist instead.

## Scope
### In (MVP)
- Input contract: extension CSV/JSON preferred; paste/manual always first-class fallback.
- Skills: review (with article-count degradation), structure对照, title + experiment list.
- Output template fixed: 结论 / 因子 / 候选 / 实验; important claims need evidence snippets or marked 推测.
- Built-in short-fiction structure summaries: human-annotated public samples, **no full text**, sources list in `references/`.
- User-pasted public对照 for other tracks / deeper samples.
- Chinese GitHub README = landing: install matrix, permission checklist, expectation alignment (篇数→深度).
- Example CSV + demo path.

### Out
- Guarantee recommendation / 爆款; proxy-login to draft box; default scrape others' real reads; hosted accounts; full multi-track expert library; commercial SLA.

### Later
- Light web upload; paid heat APIs; community track templates; optional auto-benchmark (compliance-gated).

## Article-count product rules (launch blockers)
| Count | Behavior |
|-------|----------|
| ≥30 | Relative rank + top factors; low-confidence if reads are tiny |
| 10–29 | Coarse bands only + structure + 1–2 experiments; no fine percentiles |
| <10 | No ranking; structure summary + pasted对照 + 1 experiment |
| Almost none | Checklist mode; do not invent personal-history evidence |

Reads (个位数) ≠ disqualifier. Age of account ≠ depth; **article count** drives degradation.

## Technical constraints
- Extension DOM = brittle; paste path must stay green if extension dies.
- Model API: user-chosen provider sees pasted tables/body; project has no account store.
- Hardest build: enforce FAQ debts (degradation, evidence tags, references provenance, permission list)—not "call an LLM."
- Smoke-test five Agents before claiming "minutes to first report"; else soften README copy.

## Competitive intelligence (categories)
- Export-only scrapers; title-formula Skills; write-to-draft pipelines; paid/hot-rank APIs; commercial monitors (新榜-class); editor plugins (壹伴-class).
- Gap: closed loop on **own** evidence → diagnosis → experiment → remeasure; honest non-algorithm-crack posture.

## Adoption / sustainability
- Discover via README + skills.sh / SkillHub / ClawHub; demo import→report; no paid acquisition plan for MVP.
- Moat honesty: clear loop + checkable framework + dogfood references + install convenience—not fake IP.
- Contributor hooks: track `references`, diagnosis dimensions, extension adapters.

## Kill switches
- Compliance overreach or "crack push" marketing.
- FAQ promises without repo implementation.
- `references/` empty or containing full scraped articles.
- Maintainer never dogfoods experiment→remeasure.
- Betting only on extension.

## Timeline slices (order fixed)
1. Dogfood vertical slice (real history once through).
2. Installable open-source (stranger can run on example data).
3. Extension optional/parallel; failure → document paste fallback.

## Open ASSUMPTIONS
- Final LICENSE (MIT suggested).
- Formal Chinese brand name.
- Quantitative 90-day star/issue targets.
- Whether extension ships in first public tag or follows.

## Verdict actionable items
- Spec/PRD must list as **launch blockers**: permission checklist, references provenance page, evidence-snippet behavior, article-count degradation.
- Pre-launch demo: same CSV through Skill vs bare chat—must show process difference.
- Do not open-source marketing push until dogfood vertical slice passes.
- Next skill: **bmad-spec** (preferred hub) with this PRFAQ + distillate (+ existing brief) as inputs; `bmad-prd` only if deeper requirements coaching needed.
