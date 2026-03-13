# AI 写作指南

本指南专为 AI Agent 设计，说明如何在这个 Astro 博客系统中创建和编辑内容。

## 系统设计理念

这个博客系统是为 AI 协作创作而优化的：

1. **零配置**: AI 可以直接创建 Markdown 文件，无需修改配置
2. **类型安全**: TypeScript schema 确保数据结构正确
3. **自动化**: 构建系统自动处理路由、列表和详情页
4. **标准化**: 统一的文章格式，便于 AI 理解和创作

## 内容集合

### 博客文章 (`src/content/blog/`)

博客文章使用以下 schema：

```typescript
{
  title: string;           // 文章标题
  description: string;     // 文章简介（显示在列表页）
  pubDate: Date;          // 发布日期
  tags: string[];         // 标签数组
  author: string;         // 作者（默认"杨正武"）
  image?: string;         // 可选的封面图
  draft?: boolean;        // 是否为草稿（默认 false）
}
```

### 播客内容 (`src/content/podcast/`)

播客内容使用以下 schema：

```typescript
{
  title: string;           // 标题
  description: string;     // 简介
  pubDate: Date;          // 发布日期
  tags: string[];         // 标签
  duration?: string;      // 可选的时长
  audioUrl?: string;      // 可选的音频链接
  guest?: string;         // 可选的嘉宾
  draft?: boolean;        // 是否为草稿
}
```

## 创建新文章

### 步骤 1: 创建文件

在 `src/content/blog/` 目录下创建新的 `.md` 文件。

**文件命名规范**:
- 使用小写字母
- 用连字符分隔单词
- 使用描述性名称
- 例如: `ai-agent-engineering.md`

### 步骤 2: 编写 Frontmatter

每个文章必须以 frontmatter 开头：

```yaml
---
title: "文章标题"
description: "简短的文章描述，会显示在博客列表页"
pubDate: 2026-03-13
tags: ["标签1", "标签2", "标签3"]
author: "杨正武"
---
```

**字段说明**:
- `title`: 完整的文章标题
- `description`: 1-2 句话的简介，用于 SEO 和列表展示
- `pubDate`: 发布日期（YYYY-MM-DD 格式）
- `tags`: 相关标签，会被索引用于搜索和过滤
- `author`: 作者名称（可选，默认"杨正武"）

### 步骤 3: 编写内容

使用标准 Markdown 语法：

```markdown
## 引言

这是文章的引言部分...

## 主要内容

### 子标题

内容可以包含：
- **粗体文本**
- *斜体文本*
- `代码片段`
- [链接](https://example.com)

### 代码块

\`\`\`typescript
function example() {
  console.log("Hello, World!");
}
\`\`\`

### 列表

1. 有序列表项
2. 另一项

- 无序列表项
- 另一项

### 引用

> 这是一段引用文本

### 表格

| 列1 | 列2 |
|-----|-----|
| 数据1 | 数据2 |
```

## 内容创作最佳实践

### 标题层级

- 标题（`#`）用于文章标题（在 frontmatter 中）
- 二级标题（`##`）用于主要章节
- 三级标题（`###`）用于子章节
- 避免使用四级及以下标题

### 段落

- 每段之间用空行分隔
- 段落不要太长（建议 3-5 句话）
- 使用简单直接的语言

### 代码

- 始终指定代码语言：
  ```typescript
  // 而不是
  ```
- 代码块前后各空一行
- 代码注释使用中文

### 链接

- 使用描述性链接文本：
  - ✅ `[Astro 文档](https://docs.astro.build)`
  - ❌ `[点击这里](https://docs.astro.build)`

- 优先使用相对链接引用内部内容

### 图片

- 将图片放在 `public/` 目录
- 使用绝对路径引用：`![描述](/image.png)`
- 提供有意义的 alt 文本

## AI 创作流程

### 理解任务

当收到"写一篇关于 X 的博客文章"时：

1. **分析主题**: 理解 X 的核心概念
2. **确定结构**: 引言 → 主要内容 → 结论
3. **列出要点**: 覆盖主题的关键方面
4. **选择标签**: 从内容中提取 3-5 个标签

### 起草内容

```markdown
---
title: "分析后的主题标题"
description: "一两句话总结文章内容"
pubDate: 2026-03-13
tags: ["主题", "相关技术", "应用场景"]
author: "杨正武"
---

## 引言

简要介绍主题，说明为什么重要...

## 核心概念

### 概念 1

详细说明...

### 概念 2

详细说明...

## 实际应用

展示如何使用...

## 总结

总结要点，提供进一步阅读的链接...
```

### 验证质量

在创建文件后，检查：

- [ ] Frontmatter 格式正确
- [ ] 所有必填字段都有值
- [ ] 标题层级合理
- [ ] 代码块指定了语言
- [ ] 链接使用描述性文本
- [ ] 标签相关且准确
- [ ] 内容结构清晰

## 构建和测试

### 构建站点

```bash
npm run build
```

### 预览结果

```bash
npm run preview
```

访问 http://localhost:4322 查看结果

### 开发模式

```bash
npm run dev
```

文件更改会自动刷新页面

## 常见问题

### Q: 文章没有出现在列表中？

A: 检查：
1. 文件是否在 `src/content/blog/` 目录
2. frontmatter 格式是否正确
3. `draft` 字段是否为 `false` 或未设置
4. 运行 `npm run build` 重新构建

### Q: 如何创建草稿？

A: 设置 `draft: true`：

```yaml
---
title: "草稿文章"
draft: true
---
```

### Q: 如何修改文章 URL？

A: 修改文件名。URL 路径基于文件名：
- `ai-agent-engineering.md` → `/blog/ai-agent-engineering`
- `my-post.md` → `/blog/my-post`

### Q: 可以使用子目录吗？

A: 可以，但需要更新 `getStaticPaths()` 函数。当前实现不支持子目录。

## 内容风格指南

### 语气

- 专业但不过于正式
- 使用"你"直接称呼读者
- 避免过度使用技术术语
- 必要时解释技术概念

### 格式

- **重点**: 使用粗体强调关键概念
- **代码术语**: 使用代码格式
- **引用**: 使用引用块突出重要信息

### 长度

- 简介: 1-2 段
- 主要内容: 3-5 个章节
- 每个章节: 2-4 段
- 总长度: 500-1500 字

## 相关资源

- [Astro 内容集合文档](https://docs.astro.build/en/guides/content-collections/)
- [Markdown 基础语法](https://www.markdownguide.org/basic-syntax/)
- [项目 README](./README.md)
- [博客模板](./BLOG_TEMPLATE.md)

---

**记住**: 这个系统设计为让 AI 能够轻松创作。保持简单，遵循标准，系统会处理其余的事情。
