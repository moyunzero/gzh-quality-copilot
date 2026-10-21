# 扩展冒烟（清单外 · 2026-10-20）

## 初轮（指标未齐）

- 证据：本机下载的 `articles.interchange.json`（扩展导出；含本号 url，不入库）
- 观察：有标题与 `mp.weixin.qq.com` url，但 `_missing` 含 `publish_time` / 各 count / `body`。
- 结论：当时列表抽取成功、指标未齐 → 失败则走粘贴。

## HITL 复验（5.1 通过 · 当晚）

- 操作：已发表列表页 → 扩展「导出」
- 观察（贴出 JSON 摘要）：
  - `read_count` / `like_count` / `share_count` / `wow_count` 为数字（与页面可见一致，含 0）
  - `publish_time` 为绝对 `+08:00` ISO（如 `2026-10-20T22:00:00+08:00`），非「今天/昨天」
  - `_missing` 仅剩 `body`（设计如此：不抓正文）
- 已知边角：标题偶带「原创」后缀；个别标题可能被后台 UI 截断（不同 url 的另一篇）
- 结论：**5.1 列表指标 enrichment HITL 通过**
