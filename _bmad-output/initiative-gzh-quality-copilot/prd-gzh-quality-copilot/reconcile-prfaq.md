# Reconcile — PRFAQ

*Inputs: `prfaq-gzh-quality-copilot.md` (Customer FAQ hard rules + Verdict) · distillate · `prd-gzh-quality-copilot.md`（draft）*  
*Purpose: PRFAQ/distillate 承诺 vs PRD 覆盖；标出 launch-blocking 缺口。*

## Covered in PRD

| PRFAQ / Distillate 承诺 | PRD 落点 |
|-------------------------|----------|
| 诚实框架 A：中间收益；不承诺推荐/爆款 | §1 Vision · §5 Non-Goals |
| 开源 Skills + 可选扩展；非托管 SaaS | §1 · §5 · FR-4/FR-5 |
| 粘贴一等公民；扩展脆 | FR-4；FR-5 失效后仍靠粘贴 |
| 篇数强制降级表（≥30 / 10–29 / &lt;10 / 几乎无稿）；阅读≠门槛 | FR-6（launch blocker） |
| 输出四块 + 依据片段/推测 | FR-11 · FR-12（FR-11 launch blocker） |
| 权限清单（非技术可读）与扩展行为一致 | FR-2（launch blocker） |
| `references/` 可审计、无全文、出处可查 | FR-8（launch blocker） |
| 对标粘贴；默认不扒竞品真阅读 | FR-9 · §5 |
| ≥3 标题 + 1–3 单变量实验 + 回灌提示 | FR-10 |
| 五端安装 +「数分钟」待冒烟 | FR-1 · SM-4 |
| 新人/老人预期对齐 | FR-3 |
| 示例 CSV + 陌生人复现 | FR-13 · SM-1 · UJ-3 |
| Dogfood 竖切为发版前序 | §6.3 步 1 · SM-3 |
| Skill vs 裸聊流程差（成功度量） | SM-2 |
| LICENSE / 品牌名 / 90 天数字未定 | §8 Open Q · §9 Assumptions |
| Kill：合规越权、空头 FAQ、只赌扩展 | §5 · launch blockers · SM-C2 |
| **决策分歧（PRD 更严）：** Distillate 将「扩展是否首发」列为 Open；Internal FAQ 允许扩展后置。PRD **已决** FR-5 首发必含可用扩展，并写入 §6.1/§6.3 | 非缺口；规划时以 PRD 为准 |

## Gaps (must-fix before final if launch-blocking)

> 判据：Customer FAQ 硬口径 / Verdict「空头 FAQ」与 Cracks / Distillate launch blockers——发版前若不写进 PRD 验收，会与对外 FAQ 自我打脸。

1. **模型 API 出机披露未成 FR**  
   Customer FAQ Q5 硬规则：扩展本地 ≠ 贴进对话仍不出电脑；唯一出机环节是用户所选模型服务商。PRD FR-2 只覆盖扩展权限清单，「贴表/正文 → 第三方模型」未进入 README 必写后果或独立 FR。  
   **补：** 增 FR 或扩 FR-2/FR-14 consequences：README 须明示三层隐私（扩展 / Skills / 模型 API），与 Q5 同义。

2. **Skill vs 裸聊对照未进 §6.3 发版门闩**  
   Distillate Verdict actionable + Cracks #2：发版前须固定「同 CSV：Skill vs 裸聊」演示。PRD 仅有 SM-2，§6.3 只有 dogfood → 扩展冒烟 → blockers，未把对照演示列为打公开 tag 的硬门闩。  
   **补：** §6.3 增加一步（或并入步 3）：维护者留存同 CSV 对照记录（降级/依据片段/四块稳定性可见）→ 才允许公开 tag / 开源海报。

3. **`references/`「实质内容」验收过弱**  
   Verdict Needs heat：短篇 `references/` 仍是空壳承诺；kill switch「references 空洞」。FR-8 只测「有来源清单页 + 无全文」，未要求最少可核对摘要条数/字段完整（规律信号 + 可查出处）。空目录+空来源页可形式上绿、实质上空头。  
   **补：** FR-8 consequences 增加最低实质门槛（例：≥N 条短篇结构摘要，每条含结构信号 + 出处类型/样本说明，仍无全文）。

4. **README 合规禁令未测试化**  
   Internal I8 / Cracks #3：禁止破解推荐、未授权采集须写进 README。FR-14 仅「诚实边界（不保证推荐）」，未把禁令句列为可测后果。  
   **补：** FR-14 consequences 显式要求禁令文案（禁止用于破解推流 / 未授权批量采集他号）。

## Gaps (defer OK)

| 缺口 | 理由 |
|------|------|
| skills.sh / SkillHub / ClawHub 上架列为 FR | Distillate 采纳路径；MVP 以 GitHub README 落地即可 |
| Issue 模板区分「扩展挂了」vs「诊断胡说」 | I4 维护卫生；非对外 FAQ 硬债 |
| 贡献点（赛道 references / 诊断维度 / 扩展适配）正式 FR | I4/Adoption；首发靠维护者 dogfood 即可 |
| MVP 免费开源 + 付费层未定写入 PRD | Q6；§5 已排除商业 SLA，定价叙事可后置 |
| 五端冒烟升格为与 FR-2/6/8/11 同级 launch blocker | 已有 FR-1 ASSUMPTION + SM-4；未冒烟则弱化话术即可 |
| 正式中文品牌名拍板 | 已在 Open Q / ASSUMPTION |
| 90 天 star/issue 定量 | Distillate Open；SM-5 已标 ASSUMPTION |
| 项目停更 / fork 可持续性对外 FAQ 条文 | Q6 叙事；非能力契约 |
| Later：轻量 Web、付费热度 API、社区赛道市场、自动对标 | Distillate Later ≡ PRD §6.2 |
| Skills 拆 1 包 vs 3 包 | Open Q4；不影响 FR 集合 |

---

**Counts:** must-fix **4** · defer OK **10**（表内行）  
**PRD override note:** 扩展首发（FR-5）严于 PRFAQ「可后置」——以 PRD 为 launch 真相，不记为 must-fix gap。
