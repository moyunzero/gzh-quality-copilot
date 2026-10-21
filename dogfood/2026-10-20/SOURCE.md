# Dogfood 数据来源（2026-10-20）

## 门闩 1 语料

- 路径：`../private/2026-10-20-own-account.interchange.json`（本号语料，**不入库**；见根目录 `.gitignore`）
- 篇数：59（已发出且 metrics 有阅读数）
- 形状：与 `examples/articles.interchange.json` 同构（`articles[]` + title/publish_time/read_count/…）
- 采集路径：**粘贴/台账**（非本次扩展完整导出；全号 JSON 仅存 `dogfood/private/`，不入库）
  - 阅读/分享/在看/发布时间：作者从公众号后台「内容分析」自行登记的 72h 数字
  - 正文首句：作者本地短篇草稿首行（供结构对照；非后台字段）
- 数据缺口：`like_count` 台账无列 → 填 0，复盘不以点赞排序；`url` 空

## 门闩 2 同份样本

- 路径：`sample.json`
- 从本号语料抽 8 篇（高/中/低阅读混合），固定给 Skill 路径与裸聊路径各跑一次

## 扩展冒烟（可选）

- 扩展初轮导出（本机下载，不入库）：可见本号标题+url，但字段大量 `_missing`（无 read_count 等）→ 列表抽取部分可用，指标未齐；门闩 1 改走粘贴台账，不挡勾选。
