# 杨正武的个人网站

基于 Astro 构建的个人技术网站，专为 AI 协作创作而设计。

## 项目特性

### 🤖 AI 友好设计
- **零配置博客系统**: AI 可以直接在 `src/content/blog/` 创建 `.md` 文件，系统自动生成页面
- **类型安全**: TypeScript 提供完整的类型检查，减少运行时错误
- **标准化格式**: 统一的文章结构，便于 AI 理解和创作

### 🎨 技术栈
- **框架**: Astro 4.16.12 - 零默认 JavaScript，极致性能
- **内容**: 支持 Markdown 和 MDX
- **样式**: 原生 CSS + 黑金配色方案
- **部署**: 静态站点，可部署到任何静态托管服务

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:4321

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 项目结构

```
personal-site/
├── src/
│   ├── pages/
│   │   ├── index.astro          # 主页
│   │   └── blog/
│   │       ├── index.astro      # 博客列表页
│   │       └── [slug].astro     # 博客详情页（动态路由）
│   ├── content/
│   │   ├── blog/                # 博客文章（Markdown）
│   │   └── podcast/             # 播客内容
│   └── layouts/
│       └── Layout.astro         # 全局布局
├── public/                      # 静态资源
├── astro.config.mjs             # Astro 配置
├── tsconfig.json                # TypeScript 配置
├── README.md                    # 项目说明
├── AI_WRITING_GUIDE.md          # AI 写作指南
└── BLOG_TEMPLATE.md             # 博客文章模板
```

## 内容创作

### 创建新博客文章

1. 在 `src/content/blog/` 创建新的 `.md` 文件
2. 使用以下 frontmatter 格式：

```yaml
---
title: "文章标题"
description: "文章简介"
pubDate: 2026-03-13
tags: ["标签1", "标签2"]
author: "杨正武"
---
```

3. 编写 Markdown 内容
4. 运行 `npm run build` 生成静态页面

### AI 创作指南

详细指南请参考 [AI_WRITING_GUIDE.md](./AI_WRITING_GUIDE.md)

## 核心理念

### AI Agent 工程环境
致力于构建让 AI Agent 能够高效、可靠产出高质量代码的工程环境与系统。

### 极简主义
追求最小化工具链依赖，探索轻量化前端方案。

### 工程思维
将复杂问题模块化、标准化、可复用，建立清晰的系统边界与职责划分。

## 代表作品

- **Visual Replay Tester**: 下一代桌面自动化测试工具
- **Neuro-IDE**: 所见即所得的桌面自动化测试 IDE
- **AILock-Step**: 基于 MCP 的 AI Agent 执行协议
- **Feature Workflow**: 融合 Bmad 与 OpenSpec 的 AI 工作流

## 部署

### 构建静态站点
```bash
npm run build
```

生成的文件在 `dist/` 目录。

### 部署选项
- Vercel
- Netlify
- Cloudflare Pages
- 任何支持静态网站的托管服务

## 许可证

MIT

## 联系方式

- 网站: https://imcoders.cn
- GitHub: [@auenger](https://github.com/auenger)

---

© 2026 杨正武 · Harness 工程师
