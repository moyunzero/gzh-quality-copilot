# Dogfood

维护者用真实（或脱敏）本号数据跑通复盘的证据目录。

| 路径 | 可否公开 |
|------|----------|
| [`eval/`](eval/README.md) | ✅ 固定样本 + 量表（陌生人可复现） |
| `YYYY-MM-DD/` 下的 `skill-out.md` / `scoresheet.md` / `compare-note.md` | ✅ 先确认无未脱敏 url / 隐私标题 |
| [`private/`](private/) | ❌ **永不提交** · 本号导出 / 粘贴 / 全号台账 |

扩展默认下载名 `articles.interchange.json` 若误放进仓库根目录，根 [`.gitignore`](../.gitignore) 会忽略。
