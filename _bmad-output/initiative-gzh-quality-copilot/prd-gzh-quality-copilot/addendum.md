---
title: "PRD Addendum — GZH Quality Copilot"
status: final
created: 2026-10-20
updated: 2026-10-20T10:47:00+08:00
---

# Addendum（机制 / 分发 / 调研 — 不进 PRD 主叙事）

## A. 建议仓库骨架

```text
gzh-quality-copilot/
├── README.md
├── LICENSE                    # 首 tag 前必选 SPDX（见 PRD FR-14 / §8.1）
├── skills/                    # 或拆 gzh-data-review / gzh-viral-analyze / gzh-title-content
├── examples/                  # 脱敏 CSV + 示例报告
├── extension/                 # 首发必含可用扩展；失效应急靠粘贴（PRD FR-5）
└── docs/                      # 可选 GH Pages
```

Brief 曾命名三 Skill；PRD 以能力 FR 为准，文件拆分属实现选择（§8.2）。

## B. 输入契约草案（实现时钉死列名）

最低字段（CSV/JSON）：`title`、`publish_time`（若有）、`read_count`、`like_count`、`share_count` 或等价、`wow_count`/在看（若有）、可选 `url`、可选正文。  
降级：缺字段时报告标明数据缺口，不伪造。

## C. 五端分发（细节）

同一套 `skills/`；README 只保留少量复制即装命令（npx skills add / SkillHub / OpenClaw）。  
落点路径随工具变化，以实现时 README 为准；调研表见 `brief-gzh-quality-copilot/addendum.md`。

## D. Brief vs PRFAQ 冲突决议（2026-10-20 用户确认）

| 议题 | Brief/memlog | PRFAQ | PRD 采用 |
|------|--------------|-------|----------|
| 扩展是否 MVP | Skill+扩展 | 可后置，粘贴绿可发 | **首发必须含可用扩展；粘贴=发版后永久降级，不豁免首发** |
| 纯 Skill | 早期假设后被覆盖 | — | 否决「无扩展即可首发」 |
| 篇数降级 | 未细写 | ≥30 / 10–29 / &lt;10 | **以 PRFAQ 为准** |
| 品牌/LICENSE/Skill拆分/90天指标 | ASSUMPTION | ASSUMPTION | **暂不拍板；后续按最佳实践调研回写** |

## E. 诊断维度候选（实现可裁剪）

阅读分位、点赞/转发/在看比、标题结构、发布时间、开头钩子、段落密度、悬念结构（有正文时）。全部为代理信号，非算法因果。

## F. 竞品品类（公开材料不点名具体仓）

导出类 / 标题公式 Skill / 写作进草稿流水线 / 付费热度与榜单 / 编辑插件 / 商业监测。缝隙：自有证据闭环。详细 URL 见 research 与 brief addendum。
