---
name: GZH Quality Copilot Experience
status: final
created: 2026-10-20
updated: 2026-10-20T10:58:00+08:00
design: DESIGN.md
sources:
  - prd-gzh-quality-copilot/
  - prfaq-gzh-quality-copilot/
decision: "校样台锁定；README仅Markdown；Finalize跳过审阅门闩"
---

# Foundation

- **Form factors（多表面）：**  
  1. **README（仅 Markdown，已决）** — 发现、安装、权限、预期、禁令、演示；不另建 GH Pages 演示站  
  2. **浏览器导出扩展** — 本号数据 → 本地文件（popup HTML，可含 CSS 动效）  
  3. **Agent 对话报告** — Skills **Markdown 契约**；按四块顺序输出作节奏  
- **UI system：** 无 shadcn 绑定；视觉身份见 `{DESIGN.md}`「校样台」。  
- **原则：** 诚实降级 > 漂亮完整；粘贴路径永远可达；动效分层见 DESIGN.md Motion。

# Information Architecture

| 表面 | 一级信息 | 不放什么 |
|------|----------|----------|
| README | 价值一句 → 预期对齐 → 安装（≤3 命令）→ 权限三层 → 禁令 → 演示 → 贡献 | 功能六宫格、涨粉承诺、竞品点名 |
| 扩展 | 状态（已登录本号？）→ 导出 → 结果路径 → 失败/粘贴 | 标题生成、账号托管 |
| Agent 报告 | `01结论` `02因子` `03候选` `04实验` + 角标 | 闲聊开场、保证推荐 |

深层：`references/` 来源清单、示例 CSV、Issue（扩展挂了 vs 诊断胡说）链到 README 脚注即可。

# Voice and Tone

- **像校对编辑，不像灵媒。** 短句、可反驳、标不确定。  
- 必用句式（来自 PRD/PRFAQ）：  
  - 「有历史篇数 → 复盘你自己；篇数很少 → 结构教练 + 实验本，不装懂你的数据。」  
  - 「导出在本地 ≠ 贴进对话后仍不出电脑。」  
  - 「无依据 → 推测。」  
- 禁用：爆款密码、一键涨粉、AI 已理解你的读者、保证上推荐。

# Component Patterns（行为）

| 模式 | 行为 | 视觉 token |
|------|------|------------|
| 篇数档位条 | 报告顶部声明当前档（≥30 / 10–29 / &lt;10 / 几乎无稿） | `{typography.label}` + 必要时 `{components.proof-badge}` |
| 依据片段 | 每条重要因子可定位到表行/句；可展开原文摘录 | `{components.evidence-chip}` |
| 实验卡 | 一次一变量；含「发后回灌」提示 | 左边 `{colors.accent}` 竖线动效 |
| 权限清单 | 勾选式「会做/不会做」；与扩展行为不一致=缺陷入口 | 线框列表，无圆角大卡 |
| 导出主按钮 | 进行中禁重复点；完成给文件路径；失败给粘贴 CTA | `{components.primary-cta}` / ghost |

# State Patterns

| 状态 | 用户看到 | 动效 |
|------|----------|------|
| 空（无数据） | 引导示例 CSV 或粘贴；不假装复盘 | 无 |
| 篇数 &lt;10 | 角标「不做个人史排序」+ 结构教练路径 | 角标一次淡入 |
| 低阅读高篇数 | 角标「低置信」；仍给相对排序 | 同上 |
| 推测 | 行内「推测」标记；不可写成事实 | 橙竖线 |
| 扩展导出中 | 进度；取消若可 | ink 进度条 |
| 扩展失败 | 错误原因一句 +「改用粘贴」主路径 | 无闪烁 |
| 完整成功 | 四块齐全；高潮句可复述实验变量 | 四块错峰出现 |

# Interaction Primitives

- **安装：** 复制命令 →（可选）完成勾选动画。  
- **导出：** 一键；成功打开文件夹或显示路径。  
- **报告阅读：** 锚点跳到四块；依据片段点击展开（HTML）或滚动到代码块（Markdown）。  
- **实验采纳：** 用户在 Agent 外执行；产品只提示回灌，不代发。

# Accessibility Floor

- 对比：正文 `{colors.ink}` on `{colors.paper}`；角标不只靠颜色（带文字「低置信」）。  
- `prefers-reduced-motion: reduce` → 关闭 DESIGN.md 全部动效。  
- 扩展：按钮可键盘聚焦；进度用 `aria-busy` / 文本百分比。  
- Agent Markdown：结构靠标题层级，不靠色盲不可辨的符号 alone。

# Key Flows

### F-1 · UJ-1 林修首跑（Agent + 扩展）

1. README 读预期对齐与权限三层 → 复制安装。  
2. 扩展导出本号 CSV（或粘贴）；扩展内可见进度动效。  
3. Agent 触发复盘 → **高潮：** 报告 `04实验` 写清「只改开头钩子」；四块**按序输出**（Markdown 节奏）。  
4. 他能指着实验段复述变量。  
**Edge：** 导出失败 → README/对话指引粘贴路径，不中断到报告。

### F-2 · UJ-2 阿宁少篇

1. 安装后用 5 篇或示例。  
2. 报告顶部档位「&lt;10」+ 角标「不装懂你的数据」。  
3. **高潮：** 看不到假分位图；只见结构 + 1 实验。  

### F-3 · UJ-3 外部零改代码

1. README 演示节 → 示例 CSV。  
2. 跑通四块。  
3. **高潮：** 不改仓库代码。  

### F-4 · 信任核对（非旅程但必达）

打开 README 权限清单 + 三层隐私，无需读源码即可理解模型 API 出机。

# Inspiration & Anti-patterns

**可借鉴感觉：** 印刷校对、新闻编辑后台的冷静、Linear 的克制动效（仅节奏，不抄紫黑皮肤）。  
**反模式：** Chatbot 欢迎气泡墙、功能图标超市、英雄区漂浮 AI 徽章、紫色智能渐变、无限 shimmer。

# Responsive & Platform

- README：移动端单栏；安装命令可复制；**仅 Markdown**。  
- 扩展：固定窄 popup；不勉强变 Web App。  
- Agent：Markdown 四块骨架；五端差异只在安装命令。  

# Mock coverage（Finalize）

| 表面 | 覆盖 |
|------|------|
| README | **spine-only** + `.working/sample-readme-outline.md`（章节顺序样例） |
| Agent 报告 | **spine-only** + `.working/sample-report.md`（四块+角标样例） |
| 扩展 popup | **spine-only**（无单独 HTML mock；实现按 DESIGN 组件 + Motion 表） |

用户已选 README Markdown：不渲染关键屏 HTML mock。若日后需要可视参考，可再跑 Update。

# Open Questions（UX）

1. ~~校样台是否锁定？~~ → **已决：锁定。**  
2. ~~GH Pages vs README Markdown？~~ → **已决：仅 README Markdown。**  
3. 扩展 UI 用原生 popup HTML 还是 Side Panel？`[ASSUMPTION: 首发 popup]` — 非发版阻断，实现前可按浏览器扩展最佳实践调整。  

