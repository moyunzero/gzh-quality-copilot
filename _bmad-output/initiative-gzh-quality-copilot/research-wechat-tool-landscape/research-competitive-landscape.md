---
title: Research — 微信公众号工具竞品盘点（用户提供）
status: captured
created: 2026-10-20
source: user paste during PRFAQ Stage 1
---

# 按用途的竞品 / 相邻项目盘点

## 一、自己账号数据：抓取 + 复盘（优先）

### wechat-mp-data-scraper
- 仓库：https://github.com/itshen/wechat-mp-data-scraper
- 后台页抓标题、阅读、点赞、转发、在看；本地表格；点赞率/转发率/推阅比；CSV 导出。数据仅本地。依赖后台 DOM，改版易失效。

### Access_wechat_article
- 仓库：https://github.com/yeximm/Access_wechat_article
- PC 微信 + MITM 抓公开文章元数据；SQLite；偏科研；Windows；合规仅有权内容。

### wechat-pcspider
- 仓库：https://github.com/hjyl-cheng/wechat-pcspider
- PC 自动化抓 HTML + 互动；PostgreSQL + REST；维护成本高。

### wewrite-stats（WeWrite）
- 父项目：https://github.com/imraywang/wewrite
- 拉阅读/分享/点赞回填历史；好/差表现 → 选题标题框架建议；与写作流水线一体。

## 二、对标爆款 / 赛道分析

### laolian-gzh-benchmark-hunter
- 搜爆款（wxrank Key / 微信读书备选）；下单篇；指定号批量。代理指标：单篇÷账号日常中位数。完整真阅读常付费。

### redfox-community
- wechat-title / 10w-hot / account-analyzer 等；多需 REDFOX_API_KEY。

### doubaoya-community
- 选题到草稿箱；按自己历史中位数四象限复盘；需 API Key。

## 三、标题专用 Skill

title-craft、lengyi-title、bigpeng-hot-gzh、qiaomu-xinzhiyuan-title、gzh-title-strategist — 多为单点标题生成/诊断，不接完整自有证据闭环。

## 四、全流程写作 / 运营

WeWrite、wechat-article-skills、wechat-ops-sop、wechat-mp-skill — 写作/发布主路径，复盘多为附属。

## 五、订阅 / 热度 / 素材

WeRSS（自托管订阅雷达）、awesome-wechat-markdown（导航）。

## 现实边界（用户原文）

1. 没有可靠开源能破解推流、保证高推荐。
2. 完读率、标题点击、分享、账号垂直度等是主要可观察信号。
3. 爬虫/自动化易因改版失效。
4. 他人内容批量采集注意协议与版权；自用分析、对标学习更稳妥。
