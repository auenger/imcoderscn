# AI 写作标准

本标准为 AI Agent 设计，定义了如何在 Astro 博客系统中创建高质量内容的规范。

## 系统架构

### Astro 内容集合

博客使用 Astro 的内容集合（Content Collections）功能：

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),           // 文章标题
    description: z.string(),     // SEO 描述
    pubDate: z.coerce.date(),    // 发布日期
    tags: z.array(z.string()).default([]),  // 标签
    author: z.string().default('杨正武'),    // 作者
    image: z.string().optional(),           // 封面图
    draft: z.boolean().default(false),      // 草稿标记
  }),
});

const podcast = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    duration: z.string().optional(),
    audioUrl: z.string().optional(),
    guest: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, podcast };
```

## 文章格式标准

### Frontmatter 模板

```yaml
---
title: "文章标题：简洁有力，包含核心关键词"
description: "一句话概括文章内容，用于 SEO 和列表展示"
pubDate: 2026-03-13
tags: ["标签1", "标签2", "标签3"]
author: "杨正武"
---
```

### 字段规范

**title（标题）**
- 长度：10-30 字
- 格式：主标题 + 可选副标题
- 要求：包含核心关键词，吸引读者但不过度标题党

**description（描述）**
- 长度：50-100 字
- 用途：SEO 元描述 + 博客列表展示
- 要求：准确概括文章价值，包含 2-3 个关键词

**pubDate（发布日期）**
- 格式：YYYY-MM-DD
- 时区：使用本地时区（中国标准时间）

**tags（标签）**
- 数量：3-5 个
- 格式：短语或名词，大驼峰或下划线
- 用途：分类、搜索、相关文章推荐
- 示例：["AI Agent", "AILock-Step", "工程实践"]

**author（作者）**
- 默认值："杨正武"
- 联合作者："杨正武, 合作者名"

## 内容结构标准

### 标题层级

```markdown
# H1 - 文章标题（在 frontmatter 中，不要在正文中使用）

## H2 - 主要章节
### H3 - 子章节
#### H4 - 细节说明（尽量避免使用）

正文段落...
```

### 标准文章结构

1. **引言（可选）**
   - 简要说明主题重要性
   - 1-2 段，不超过 200 字

2. **核心内容**
   - 3-5 个主要章节（H2）
   - 每个章节包含 2-4 个子要点
   - 使用代码块、列表、表格等丰富格式

3. **总结（可选）**
   - 回顾关键要点
   - 提供进一步阅读方向
   - 1 段，不超过 150 字

### 代码块规范

```markdown
\`\`\`typescript
// 始终指定语言
function example() {
  return 'Hello';
}
\`\`\`

// ❌ 不要使用无语言标记的代码块
\`\`\`
some code
\`\`\`
```

### 列表规范

```markdown
// 无序列表（默认）
- 要点 1
- 要点 2

// 有序列表（步骤或优先级）
1. 第一步
2. 第二步

// 嵌套列表
- 主要点
  - 子要点
  - 另一个子要点
```

### 链接规范

```markdown
// 内部链接（相对路径）
[相关文章](/blog/related-post)

// 外部链接
[Astro 文档](https://docs.astro.build)

// 引用链接
[GitHub][github-link]

[github-link]: https://github.com/auenger
```

## 内容质量标准

### 语气和风格

- **专业但不过度正式**：使用"你"直接称呼读者
- **简洁清晰**：每段 3-5 句话，每句 15-25 字
- **避免过度术语**：必要时解释技术概念
- **使用主动语态**："系统构建了..." 而不是"...被系统构建"

### 段落结构

- **每段一个主题**：不要混合多个观点
- **第一句主题句**：快速告诉读者这段讲什么
- **最后一句总结**：自然过渡到下一段

### 可读性优化

- **使用粗体强调**：核心概念、关键结论
- **使用引用突出**：重要定义、警示信息
- **使用代码格式**：技术术语、命令、文件名
- **使用列表拆分**：超过 3 个项目的信息

## AI 创作流程

### 接收任务

当收到创作任务时，按以下步骤执行：

1. **理解主题**
   - 分析核心概念
   - 确定目标读者
   - 明确文章价值

2. **规划结构**
   - 列出 3-5 个主要章节
   - 为每个章节分配要点
   - 确定 3-5 个标签

3. **起草内容**
   - 按照标准结构写作
   - 使用适当的格式
   - 添加代码示例

4. **质量检查**
   - [ ] Frontmatter 完整且正确
   - [ ] 标题层级合理
   - [ ] 代码块指定语言
   - [ ] 链接使用描述文本
   - [ ] 标签相关且准确
   - [ ] 内容结构清晰

### 文件创建

在 `src/content/blog/` 创建文件：

```bash
# 文件命名规范
yyyy-mm-dd-short-title.md
# 例如
2026-03-13-ai-agent-engineering.md
```

## 常见问题

### Q: 文章没有出现在列表中？

**A**: 检查：
1. 文件在 `src/content/blog/` 目录
2. frontmatter 格式正确
3. `draft: false` 或未设置
4. 运行 `npm run build` 重新构建

### Q: 如何创建草稿？

**A**: 设置 `draft: true`：

```yaml
---
title: "草稿文章"
draft: true
---
```

### Q: 如何修改 URL？

**A**: 修改文件名。URL 基于文件名：
- `2026-03-13-my-post.md` → `/blog/2026-03-13-my-post`
- `my-post.md` → `/blog/my-post`

### Q: 支持子目录吗？

**A**: 当前不支持。所有文件直接放在 `src/content/blog/`。

## 最佳实践总结

1. **从模板开始**：使用 BLOG_TEMPLATE.md 确保格式正确
2. **保持一致**：所有文章使用相同的结构和风格
3. **SEO 优化**：标题和描述包含关键词
4. **可扫描性**：使用标题、列表、粗体让内容易于浏览
5. **原创价值**：提供独特见解，避免重复已有内容

---

**记住**：这个系统的设计目标是让 AI 能够轻松创建高质量内容。保持简单，遵循标准，系统会处理其余的事情。
