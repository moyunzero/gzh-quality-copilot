---
title: Addendum — 分发调研 / 竞品缝隙 / 选项矩阵
status: draft
created: 2026-10-20
updated: 2026-10-20
---
<!-- research: 爆款样本 A/B/C 市面做法 -->

# Addendum

## A. 跨 Agent 分发调研（便利性）

标准：[Agent Skills](https://agentskills.io/home)（目录 + `SKILL.md`）。

| 工具 | 一键/近似一键 | Skill 落点 | 发现渠道 |
|------|---------------|------------|----------|
| **Cursor** | `npx skills add owner/repo -a cursor`（可 `-g`） | `.agents/skills/` / `~/.cursor/skills/`；兼容 `.claude`/`.codex` | [skills.sh](https://www.skills.sh/)、GitHub；官方另有 plugin marketplace |
| **Claude Code** | `npx skills add … -a claude-code`；或 `claude plugin marketplace add` | `~/.claude/skills/` / `.claude/skills/` | Anthropic marketplace、skills.sh |
| **Codex** | `npx skills add … -a codex`；或 `$skill-installer` / GitHub | `.agents/skills/`、`~/.codex/skills/` | openai/skills、Plugins Directory、skills.sh |
| **WorkBuddy** | 技能市场「+」；SkillHub `skillhub install` / publish | `~/.workbuddy/skills/` | [SkillHub](https://www.skillhub.cn/)、对话找技能 |
| **OpenClaw** | `openclaw skills install git:owner/repo` 或 ClawHub | `~/.openclaw/skills` / 项目 `skills/` | [ClawHub](https://docs.openclaw.ai/clawhub/quickstart)、skills.sh |

**成功微信 Skill 的共性（bigpeng / lengyi / liucong / laolian / wechat-ops-sop）：**

1. 单一清晰 job  
2. `SKILL.md` 短 + `references/` 渐进披露  
3. README「复制即装」矩阵  
4. `description` 写满中文触发词  
5. 数据：先「用户自带」；真实阅读量再可选付费 API  

## B. 形态 Tradeoff

| 方案 | 优点 | 缺点 | 建议阶段 |
|------|------|------|----------|
| 纯 Skill | 五端最快；无密钥焦虑；开源信任高 | 无实时后台；靠粘贴/导入 | **MVP** |
| Skill + 导出扩展 | 真数据闭环 | 维护/审核/登录态脆弱 | V1.1 可选 |
| Skill + Web | 覆盖非 Agent 用户；可商业化 | 运维与合规重；与 Agent 割裂 | 获客漏斗阶段 |

## C. 推荐仓库骨架

```text
gzh-quality-copilot/
├── README.md                 # 中文落地页
├── docs/                     # 可选 GH Pages
├── skills/
│   ├── gzh-data-review/
│   ├── gzh-viral-analyze/
│   └── gzh-title-content/
├── examples/                 # 脱敏样例 CSV + 示例报告
├── .claude-plugin/           # 可选
└── agents/openai.yaml        # 可选 Codex UI
```

**README 只保留三条安装命令（示例）：**

```bash
npx skills add <you>/gzh-quality-copilot
# WorkBuddy: SkillHub 一键 或 skillhub install …
# OpenClaw: openclaw skills install git:<you>/gzh-quality-copilot
```

## D. 与作者狗粮（短篇小说 × 60+ 篇）对齐的诊断维度（草案）

可观测代理指标（非官方算法）：

- 阅读量分位、点赞率、转发率、在看/推阅比  
- 标题长度与信息结构（悬念/反转/人物/情绪词）  
- 发布时间分布  
- （有正文时）开头 300 字钩子类型、段落密度、章末悬念  

输出模板固定：`复盘结论 → Top 爆款因子 → 3 标题 + 1 大纲/开头建议 → 下一篇实验清单`。

## E. 竞品缝隙（为何还值得做）

已有：抓数、对标、标题公式、SOP。  
缺口：**自有数据证据链 + 跨 Agent 一键装 + 赛道可插拔 references（小说先做）**。

`redfox-community/wechat-title`：调研时仓库未解析到，不纳入竞品表。

## F. 待用户确认的 ASSUMPTIONS

1. ~~仓库名~~ 已定为 `gzh-quality-copilot`；展示中文名是否用「公众号质量 Copilot」
2. License 默认 MIT  
3. MVP 是否坚持「纯 Skill、无扩展」  
4. 落地页：仅 README vs README + GH Pages  
5. 90 天开源成功指标（star / 外部复现人数）  

## G. 爆款样本：市面怎么做（A/B/C）

| 类型 | 含义 | 市面代表 |
|------|------|----------|
| **A 内置蒸馏** | 作者离线收爆款→只提交公式/标题表/信号，不交全文爬虫 | bigpeng（~100 标题公式）、lengyi（自有号 TOP50）、liucong（645 篇→关键词信号表） |
| **B 用户提供** | 粘贴草稿/对标链接/自有后台导出 | 几乎所有 Skill 输入端；壹伴导自有号 |
| **C 自动对标** | 程序搜爆文+拉指标 | laolian（wxrank 付费 + 微信读书免费候选）；WeRSS（订阅池热点聚类，非全网榜） |
| **D 其他** | 人工去新榜/搜一搜；商业监测库 | wechat-ops-sop 指引；新榜/西瓜/清博 |

| 项目 | A | B | C | 备注 |
|------|---|---|---|------|
| bigpeng-hot-gzh | ✓ | ✓ | | 内置规律，无原文库 |
| lengyi-title | ✓ | ✓ | | 自有号蒸馏 TOP50 |
| gzh-title-strategist | ✓ | ✓ | | 645→signals，不查实时指数 |
| laolian-benchmark-hunter | | ✓ | ✓ | 无内置爆款库；C 是主菜 |
| WeRSS | | 弱 | ✓′ | 订阅池，不是全网爬 |
| wechat-ops-sop | | ✓ | | +D 人工榜单指引 |
| 新榜/西瓜/清博 | | | ✓ | 商业监测；阅读≠官方后台真值 |

**决策（2026-10-20）：** A+B 进 MVP；C 作为可选进阶（非冷启动阻塞）。三者都「合理」，但不是「MVP 三件同时必做」。

权衡：新鲜度 C≫A≈B；合规风险 C≫A（全文）>A（仅标题规律）≈B；冷启动 A 最好。

## H. 关键来源

- https://agentskills.io/home  
- https://cursor.com/docs/skills  
- https://www.skills.sh/docs  
- https://code.claude.com/docs/en/skills  
- https://learn.chatgpt.com/docs/build-skills  
- https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market  
- https://www.skillhub.cn/tutorials  
- https://docs.openclaw.ai/skills/  
- https://docs.openclaw.ai/clawhub/quickstart  
- https://github.com/BigPengSays/bigpeng-hot-gzh  
- https://github.com/woyin2024/lengyi-title  
- https://github.com/liucongg/liucong-skills  
- https://github.com/oldfacekg26/laolian-gzh-benchmark-hunter  
- https://github.com/letuswerss/werss  
- https://wxrank.com/terms  

