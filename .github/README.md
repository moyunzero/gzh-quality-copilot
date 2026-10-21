# GitHub meta

## Open Graph 预览图

标准尺寸 **1280×640**（GitHub Social preview / 外链 OG 共用）：

| 文件 | 说明 |
|------|------|
| [`og-image.png`](og-image.png) | **主文件** · Open Graph |
| [`og-image.jpg`](og-image.jpg) | 同图 JPEG（更小） |
| [`social-preview.png`](social-preview.png) | 与 `og-image.png` 相同，便于对照 GitHub 设置项名称 |

GitHub **没有** API 可写入 Social preview，需网页上传一次（上传后即成为仓库的 `og:image`）：

1. https://github.com/moyunzero/gzh-quality-copilot/settings#social-preview  
2. **Edit** → **Upload an image…** → 选 `og-image.png`  
3. Save  

校验：

```bash
gh api graphql -f query='query { repository(owner: "moyunzero", name: "gzh-quality-copilot") { usesCustomOpenGraphImage openGraphImageUrl } }'
```
