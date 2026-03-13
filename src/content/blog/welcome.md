---
title: "欢迎来到我的技术博客"
description: "基于 Astro 构建的 AI 友好博客系统"
pubDate: 2026-03-13
tags: ["AI", "Astro", "博客系统"]
author: "杨正武"
---

## 引言

这是基于 Astro 构建的个人技术博客。系统设计考虑了 AI 协作创作的需求，让 AI 可以直接创建 Markdown 文件并自动生成静态页面。

## 系统特性

### 简单的内容创作

AI 可以直接在 `src/content/blog/` 目录下创建 `.md` 文件。系统会自动解析 frontmatter 元数据，生成静态页面，并添加到博客列表。整个过程无需手动配置。

### 标准化的文章格式

每篇文章只需要包含基本的 frontmatter 信息：

```yaml
---
title: "文章标题"
description: "文章简介"
pubDate: 2026-03-13
tags: ["标签1", "标签2"]
author: "杨正武"
---
```

### 完整的 Markdown 支持

系统支持完整的 Markdown 语法。代码块带语法高亮，表格用于数据展示，引用块突出重点内容，列表用于结构化信息，链接可以引用外部资源。

## 技术栈

这个博客使用 Astro 作为静态站点生成器。Astro 的优势在于零默认的 JavaScript，页面加载速度快，对搜索引擎友好。

内容使用 Markdown 格式存储，方便版本控制和协作编辑。TypeScript 提供类型安全，减少运行时错误。

视觉设计采用黑金配色方案，保持整个站点的视觉一致性。

## 开始使用

创建新文章只需要三个步骤。直接在 `src/content/blog/` 创建新的 `.md` 文件，按照模板格式编写内容，然后运行 `npm run build` 生成静态站点。

完整的写作指南和模板参考 `AI_WRITING_GUIDE.md` 和 `BLOG_TEMPLATE.md`。
