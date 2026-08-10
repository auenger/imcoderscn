# 文章封面图生成工具集

为你的博客文章自动生成专业的封面图。

## 🎨 工具列表

### 1. SVG 封面图生成器 ⭐ **推荐**

**文件**: `svg-generator.html`

**特点**:
- ✅ 专业、稳定、可控
- ✅ 4 种配色风格
- ✅ 实时预览
- ✅ 支持 PNG/SVG 导出
- ✅ 完美适配社交平台 (1200x630)

**使用方法**:
```bash
# 在浏览器中打开
open scripts/svg-generator.html
```

**风格选项**:
- 黑金风格（默认，匹配网站主题）
- 蓝色科技
- 绿色极客
- 紫色创意

---

### 2. AI 图片生成器

**文件**: `image-generator.html`

**特点**:
- 🎨 AI 自动生成创意封面
- 🆓 完全免费
- 🎯 根据文章内容智能生成

**使用方法**:
```bash
# 在浏览器中打开
open scripts/image-generator.html
```

---

## 📝 使用流程

### 单篇文章

1. **打开生成器**
   ```bash
   open scripts/svg-generator.html
   ```

2. **输入文章信息**
   - 标题：文章的完整标题
   - 标签：主要标签（如 "AI Agent"）
   - 作者：你的名字
   - 风格：选择配色

3. **下载封面图**
   - 点击 "🖼️ 下载 PNG"
   - 保存到 `public/blog-images/文章名.png`

4. **在文章中引用**
   ```yaml
   ---
   title: '文章标题'
   image: /blog-images/文章名.png
   ---
   ```

### 批量处理

1. 打开 `scripts/svg-generator.html`

2. 为每篇文章生成封面图

3. 下载并保存到 `public/blog-images/`

4. 在每篇文章的 frontmatter 中添加 `image` 字段

---

## 🎯 效果示例

**生成的封面图包含**:
- 📌 文章标签（左上角）
- 📝 文章标题（自动换行，最多 3 行）
- 👤 作者信息（左下角）
- 🌐 网站地址（右下角）
- 🖼️ Logo（右上角）
- 🎨 专业背景和装饰元素

---

## 💡 最佳实践

### 1. **文件命名规范**
```
public/blog-images/
├── mate-agent-context-optimization.png
├── ai-agent-engineering.png
├── neuro-ide.png
└── ...
```

### 2. **图片尺寸**
- **推荐**: 1200 x 630 (Facebook/Twitter/LinkedIn 标准)
- **最小**: 800 x 400
- **格式**: PNG（支持透明度）

### 3. **标签建议**
使用文章的第一个标签作为封面图标签：
- `AI Agent` → 封面显示 "AI AGENT"
- `系统设计` → 封面显示 "系统设计"
- `前端技术` → 封面显示 "前端技术"

---

## 🔧 技术实现

### SVG 模板生成器
- 纯前端实现
- 使用 SVG + Canvas 导出 PNG
- 支持自定义配色方案
- 响应式实时预览

### AI 生成器
- 使用 Pollinations.ai API
- 无需 API Key
- 支持多种风格
- 自动增强图片质量

---

## 📚 相关资源

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing](https://developers.facebook.com/docs/sharing/webmasters/)

---

## ❓ 常见问题

**Q: 为什么要用 1200x630 尺寸？**
A: 这是 Facebook、Twitter、LinkedIn 等主流社交平台推荐的 Open Image 尺寸。

**Q: PNG 和 SVG 有什么区别？**
A: SVG 是矢量图，可以无限缩放；PNG 是位图，更适合社交平台分享。

**Q: 可以自动批量生成吗？**
A: 可以编写脚本调用这些工具，但建议手动调整以确保质量。

**Q: AI 生成的图片会重复吗？**
A: AI 工具使用随机种子，每次生成不同的图片。

---

**作者**: Ryan
**创建日期**: 2026-03-13
**版本**: 1.0
