# GitHub meta

## Social preview

Source art: `social-preview.png` (1280×640) · lighter `social-preview.jpg`.

GitHub **没有** API 可设置 Social preview，需在网页上传一次：

1. Open https://github.com/moyunzero/gzh-quality-copilot/settings#social-preview  
2. **Edit** → **Upload an image…** → 选本目录 `social-preview.png`  
3. Save

Verify later:

```bash
gh api graphql -f query='query { repository(owner: "moyunzero", name: "gzh-quality-copilot") { usesCustomOpenGraphImage openGraphImageUrl } }'
```
