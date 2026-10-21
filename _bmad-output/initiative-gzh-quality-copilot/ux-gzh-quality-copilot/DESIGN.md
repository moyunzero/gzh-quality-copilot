---
name: Proof Desk（校样台）
description: "GZH Quality Copilot visual identity — cool pressroom proof desk; anti-AI-slop; motion as evidence reveal."
status: final
created: 2026-10-20
updated: 2026-10-20T10:58:00+08:00
sources:
  - prd-gzh-quality-copilot/
  - prfaq-gzh-quality-copilot/
decision: "2026-10-20 用户锁定校样台；演示载体=README Markdown（无 GH Pages HTML 演示）"
colors:
  ink: '#12141A'
  ink-muted: '#4A5160'
  paper: '#EEF1F5'
  paper-elevated: '#F7F8FA'
  rule: '#C5CCD8'
  rule-strong: '#8B95A8'
  accent: '#C45C26'
  accent-soft: '#F3E0D4'
  signal-low: '#6B7280'
  signal-ok: '#1F6B5A'
  signal-warn: '#A65D1A'
  danger: '#9B2C2C'
  code-bg: '#E4E8EF'
typography:
  display:
    fontFamily: 'Fraunces'
    fontSize: 40px
    fontWeight: '550'
    lineHeight: '1.15'
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Fraunces'
    fontSize: 24px
    fontWeight: '550'
    lineHeight: '1.25'
  body:
    fontFamily: 'IBM Plex Sans'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.65'
  label:
    fontFamily: 'IBM Plex Sans'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0.06em'
  mono:
    fontFamily: 'IBM Plex Mono'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  none: 0
  sm: 2px
  md: 4px
  lg: 8px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  gutter: 24px
  margin-readme: 40px
components:
  proof-badge:
    background: '{colors.accent-soft}'
    color: '{colors.accent}'
    rounded: '{rounded.sm}'
    typography: '{typography.label}'
  evidence-chip:
    background: '{colors.code-bg}'
    color: '{colors.ink}'
    typography: '{typography.mono}'
    rounded: '{rounded.sm}'
  primary-cta:
    background: '{colors.ink}'
    color: '{colors.paper-elevated}'
    rounded: '{rounded.md}'
  ghost-cta:
    background: transparent
    color: '{colors.ink}'
    border: '1px solid {colors.rule-strong}'
    rounded: '{rounded.md}'
---

# Brand & Style

**已锁定（2026-10-20）：** 品牌视觉方向 =「校样台 / Proof Desk」。

气质：**冷静的编辑室校对台**，不是 AI 仪表盘。像把文章钉在台面上用红笔圈问题——工具感来自**校样痕迹**（下划线、页边注、编号块），不是霓虹渐变或「智能光晕」。

记忆点：  
1. **校对橙** `{colors.accent}` 只用于「需要你动手的标记」（实验、低置信、推测）——不是满屏品牌紫。  
2. **四块报告**用装订线式横线分区，像校样分页，而不是四张圆角卡片堆叠。  
3. **动效 = 证据展开**：块按序出现、依据片段墨水渗入，不做弹跳吉祥物。

反 AI 味硬规则见 Do's and Don'ts。

# Colors

| Token | Role |
|-------|------|
| `{colors.paper}` | 默认底——冷灰纸，**不要**暖奶油底 |
| `{colors.ink}` | 正文与主 CTA |
| `{colors.accent}` | 校对标记、实验高亮、低置信角标 |
| `{colors.signal-ok}` | 仅「粘贴路径可用 / 导出成功」类系统态 |
| `{colors.signal-low}` | 低置信、篇数不足声明 |
| `{colors.danger}` | 禁令、错误（扩展失败） |

禁止：紫青渐变、全屏 glow、霓虹边、玻璃拟态叠三层阴影。

# Typography

- **Display / Headline：** Fraunces（有墨迹感的书体，非 Inter）  
- **Body / Label：** IBM Plex Sans  
- **依据片段 / 字段 / 命令：** IBM Plex Mono  

**README 仅为 Markdown（已决）：** 无法锁自定义字体与 CSS 动效——用标题层级、`---`、编号列表、代码块表达校样结构。Fraunces / Plex 字体与完整 Motion 表仅约束 **扩展 popup HTML** 与未来若另开的视觉页；不为此单独立 GitHub Pages 演示。

# Layout & Spacing

- README / 演示页：单栏阅读，`{spacing.margin-readme}` 大边距；安装步骤竖排编号，**不要**三列特性卡片墙。  
- 扩展弹层：窄宽 ~360px；顶栏标题 + 一主按钮；权限清单折叠在下方。  
- Agent 报告：纯 Markdown 时用 `---` 与 `###` 模拟装订线；可选「演示 HTML」才用完整 token。

# Elevation & Depth

极浅：主要靠 `{colors.rule}` 线与纸面层级，**默认无投影**。仅扩展弹层可用 `0 1px 0 {colors.rule}` 发丝阴影。禁止多层 soft shadow。

# Shapes

小圆角 `{rounded.sm}`–`{rounded.md}` 为主；**禁止** `rounded-full` 胶囊标签成排。角标用直角或 2px。

# Components

### Proof badge（校对角标）
用于「低置信」「推测」「样本不足」。背景 `{colors.accent-soft}`，字 `{colors.accent}`，全大写或短中文（「推测」「低置信」）。

### Evidence chip（依据片段）
等宽字体引用表行/句段；底 `{colors.code-bg}`；可点击展开（演示 HTML）或纯代码块（Agent）。

### CTA
主按钮：墨色底；次按钮：线框。扩展「导出」= 主 CTA；「改用粘贴说明」= ghost。

### Report blocks（四块）
标题用 Headline；块间 1px `{colors.rule-strong}`；块序号 `01–04` 用 Label + Mono。

# Motion（必做 · 去装饰）

**分层（已决 README = Markdown）：**

| 表面 | 动效怎么落地 |
|------|----------------|
| **README Markdown** | **无 CSS。** 「动效」= 阅读节奏：固定章节顺序（价值→预期→安装→权限→禁令→演示）；安装步骤用有序清单；演示报告用 `01→04` 块顺序。 |
| **Agent Markdown 报告** | **无 CSS。** Skill **按块顺序输出**（结论→因子→候选→实验），模拟错峰展开；角标用文字「低置信」「推测」。 |
| **扩展 popup HTML** | **完整 CSS Motion**（下表）；`prefers-reduced-motion: reduce` 时瞬时显示。 |

### 扩展 popup 动效表

| 场景 | 动效 | 时长 / 缓动 |
|------|------|-------------|
| 导出进度 | 底边 ink 进度条 scaleX 0→1；完成勾选 | 跟真实进度；完成 300ms |
| 成功/失败切换 | opacity 交叉淡入 | 200ms ease-out |
| 权限清单展开 | height/opacity；禁止弹跳 | 180ms |

禁止：README/Agent 里用 GIF 无限 shimmer 冒充智能。

# Do's and Don'ts

**Do**
- 用校对橙标记「要你判断/实验」的点  
- 用等宽字体呈现证据  
- 动效服务「展开证据」  
- 冷纸 + 墨字，像印刷校样  

**Don't**
- 紫粉渐变、AI 光球、hero 上漂浮徽章  
- Inter / Roboto / 系统默认堆当品牌字体  
- 圆角大卡片栅格 + 图标行「六大功能」  
- 「一键爆款」「智能推荐」类视觉文案  
- 无限循环 pulse / shimmer 骨架冒充智能  
