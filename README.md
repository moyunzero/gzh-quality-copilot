# 公众号质量 Copilot

**本号相对复盘 · 结构教练 · 可粘贴下一篇实验。**  
不保证推荐，不破解推流，不扒他号。

用你自己的已发表数据（扩展导出或粘贴），在 Agent 里跑出固定四块报告：结论 → 因子 → 候选 → 实验。篇数少时诚实降级，不当「懂你历史」的算命。

| | |
|---|---|
| **Skill** | [`gzh-review`](skills/gzh-review/SKILL.md) + 契约 [`skills/_shared/contracts.md`](skills/_shared/contracts.md) |
| **扩展** | Chrome MV3 · [`extension/`](extension/) · 仅读本号后台列表 |
| **评测** | Skill vs 裸聊 · [`dogfood/eval/`](dogfood/eval/README.md) |
| **许可** | [MIT](LICENSE) |

---

## Quick Start

约两分钟跑通「粘贴金样 → 四块报告」（不依赖扩展）。

```bash
# 1. 打开本仓库后，在仓库根目录安装 Skill（Cursor 示例）
npx skills add . --skill gzh-review -a cursor -y
```

2. 确认 Skills 目录里 `gzh-review` **旁边**有 `_shared`（没有就从本仓库 `skills/_shared` 拷过去）。  
3. **新开**一轮 Agent，加载 `gzh-review`，打开或粘贴  
   [`examples/articles.interchange.json`](examples/articles.interchange.json)，说「复盘」。  
4. 对照形状：[`examples/sample-report.md`](examples/sample-report.md)。

本号真实数据：用扩展导出（见下），或按同一 interchange 形状粘贴 JSON/CSV。

---

## 你能用它做什么

- **相对复盘**：有足够篇数时看结构规律；篇数很少 → 结构教练 + 实验本，**不做个人史排序**  
- **可发实验**：`## 04 实验` 含可粘贴标题、开头写法、单变量约束、发后回灌  
- **本号导出**：已登录公众号后台列表页 → 扩展「导出」到本机 JSON  
- **可复现对照**：同一份固定样本，Skill vs 裸聊按表打分（[eval harness](dogfood/eval/README.md)）

分档规则（篇数门槛）以契约为准，不要另造表：[`skills/_shared/contracts.md`](skills/_shared/contracts.md)。  
60+ 篇只是维护者 dogfood 量级，**不是**入场门槛。

---

## 安装 Skill

先克隆或打开本仓库，在**仓库根目录**执行。包名：`gzh-review`（目录 `skills/gzh-review/`）。  
**始终**保持 `gzh-review` 与 `skills/_shared` 并列；安装工具若只拷了前者，请手动补上 `_shared`。

### Cursor

```bash
npx skills add . --skill gzh-review -a cursor -y
```

新开 Agent；可用 `/` 搜索 `gzh-review`，或说「复盘」「本号数据」。  
文档：[Cursor Agent Skills](https://cursor.com/docs/skills)

### Claude Code

```bash
npx skills add . --skill gzh-review -a claude-code -y
```

装到 `.claude/skills/`。手工拷贝时同样保持 `gzh-review` 与 `_shared` 并列。  
文档：[Claude Code Skills](https://code.claude.com/docs/en/skills)

### Codex

```bash
npx skills add . --skill gzh-review -a codex -y
```

装到 `.agents/skills/`。  
文档：[Codex skills](https://learn.chatgpt.com/docs/build-skills)

### WorkBuddy

尚无与本仓库绑定的单一官方 `npx skills -a` 一行命令。按 [SkillHub](https://www.skillhub.cn/) / 技能市场「+」，或 `skillhub install`（见 [教程](https://www.skillhub.cn/tutorials)）；也可把 `skills/gzh-review` 与 `skills/_shared` 拷到 `~/.workbuddy/skills/`（保持并列）。CLI 完整示例见上方 **Cursor**。

### OpenClaw

```bash
openclaw skills install ./skills/gzh-review
```

装完后确认 OpenClaw skills 目录里 `gzh-review` 旁有 `_shared`。  
CLI：[openclaw skills](https://docs.openclaw.ai/cli/skills)。公开 git 远程就绪后可用 `openclaw skills install git:<owner>/gzh-quality-copilot`。

---

## 扩展（本号列表 → 本地 JSON）

1. `cd extension && npm install && npm run build`  
2. Chrome → `chrome://extensions` → 开发者模式 →「加载已解压的扩展程序」→ 选本仓库 `extension/`  
3. 登录 [公众号后台](https://mp.weixin.qq.com)，打开**本号已发表列表**（`appmsg` / `appmsgpublish`）  
4. 点扩展 → **导出** → 本机得到 `articles.interchange.json`

失败时弹窗会出现「改用粘贴」：把同形状 JSON/CSV 贴进 Agent 即可。扩展挂了**不阻断**复盘。

**关于 `body`：** 扩展**故意不抓正文**；导出里 `body` 会出现在 `_missing` 中，这是正常行为。金样 / eval 样本可含 `body`，仅供粘贴演示与结构对照。

夹具（不登录）：弹窗 **夹具导出**。

---

## 权限与隐私

不必读代码即可对照；与 [`extension/manifest.json`](extension/manifest.json) 不一致即为缺陷。弹窗「会做」与此同源冻结，**清单以 manifest 为准**。

**权限清单（与 manifest 原文一致）：**

- `permissions`: `["downloads","tabs","scripting"]`
- `host_permissions`: `["https://mp.weixin.qq.com/*"]`

**三层隐私：**

1. **扩展本地导出** — 只在你已登录的后台读本号已发表数据，导出到本机。不代持登录、不代发、不读他号、不上传到本项目服务器（本项目无云端账号）。  
2. **Skills** — 提示词与资料开源，跑在你自己的 Agent 里。  
3. **模型 API（唯一会离开本机的环节）** — 你贴进对话的内容会发给你选用的模型服务商；密钥与账单是你与该服务商之间的事。「导出在本地」≠「贴进对话后仍不出电脑」。

---

## 禁令

- 禁止用于破解推流或预测推荐算法  
- 禁止保证推荐 / 保证爆款类话术  
- 禁止未授权批量采集他号数据  

---

## 演示与评测

| 资源 | 说明 |
|------|------|
| [examples/articles.interchange.json](examples/articles.interchange.json) | 金样 JSON（[CSV 孪生](examples/articles.interchange.csv)） |
| [examples/sample-report.md](examples/sample-report.md) | 四块报告形状 |
| [dogfood/eval/README.md](dogfood/eval/README.md) | Skill vs 裸聊 · 陌生人可复现 |
| [LAUNCH-GATES.md](LAUNCH-GATES.md) | 维护者发版门闩（Dogfood / 对照） |

---

## 贡献 / License

[MIT](LICENSE) · Copyright (c) 2026 GZH Quality Copilot contributors  

欢迎 Issue / PR。改 Skill 或契约后，请按 [eval harness](dogfood/eval/README.md) 重跑对照并留下记分表。
