---
title: "Feature Workflow：基于 Worktree 的多特性并行开发范式"
description: "融合 Bmad 与 OpenSpec 的 AI 工作流，实现真正的多特性并行开发"
pubDate: 2026-03-13
tags: ["工作流", "Git Worktree", "并行开发", "多Agent", "AILock-Step"]
author: "杨正武"
---

## 引言

在 AI 辅助开发的实际应用中，多特性并行开发面临几个核心问题。不同需求的代码会相互干扰，AI 容易产生上下文混淆。传统分支切换方式会导致工作进度丢失。多个 AI Agent 同时工作时，代码冲突难以避免。需求状态管理混乱，无法追溯开发历史。

为了解决这些问题，我设计了 Feature Workflow。这是一个融合了 Bmad 和 OpenSpec 优秀理念的工作流范式，基于 Git Worktree 实现真正的物理隔离，支持多 Agent 并行开发，从根本上避免了代码冲突问题。

## Worktree 物理隔离

### 传统开发方式的问题

传统 Git 工作流使用分支隔离代码，但开发环境共享同一个工作目录。

```
OA_Tool/                    # 唯一的工作目录
├── src/
├── package.json
└── .git/

# 切换分支时的困境
git checkout feature/auth
# 当前未提交的代码被覆盖，需要 stash 或 commit
# 开发一半的 dashboard 功能无法保留
```

这种方式导致三个问题。切换分支会丢失未完成的工作进度。无法同时开发多个需求。AI 上下文在分支切换时容易混淆。

### Worktree 的物理隔离方案

Git Worktree 允许在同一个仓库下同时检出多个分支到不同目录。

```
OA_Tool/                        # 主仓库 (main 分支)
├── src/
├── package.json
└── feature-workflow/

OA_Tool-feat-auth/              # Worktree 1 (feature/auth 分支)
├── src/auth/                   # 独立的代码副本
├── .git/                       # 共享 Git 数据库
└── features/
    └── active-feat-auth/
        ├── spec.md
        ├── task.md
        └── checklist.md

OA_Tool-feat-dashboard/         # Worktree 2 (feature/dashboard 分支)
├── src/dashboard/              # 独立的代码副本
└── features/
    └── active-feat-dashboard/
        ├── spec.md
        ├── task.md
        └── checklist.md
```

每个 worktree 有独立的文件副本和 HEAD，但共享同一个 Git 数据库。这带来了几个关键优势。

### 开发环境完全隔离

不同需求的代码互不干扰，可以真正并行开发。

```
# 终端 1：开发认证功能
cd OA_Tool-feat-auth
npm run dev
# 运行在 3000 端口

# 终端 2：开发仪表盘功能
cd OA_Tool-feat-dashboard
npm run dev
# 运行在 3001 端口
```

无需频繁切换分支，每个需求有独立的开发服务器。AI Agent 可以在不同的 worktree 中并行工作，上下文完全隔离。

### 独立的测试验证

每个 worktree 有独立的测试环境，证据收集互不干扰。

```
OA_Tool-feat-auth/
├── e2e/
│   └── auth.spec.ts           # 只测试认证功能
└── evidence/
    ├── screenshots/
    └── traces/

OA_Tool-feat-dashboard/
├── e2e/
│   └── dashboard.spec.ts      # 只测试仪表盘功能
└── evidence/
    ├── screenshots/
    └── traces/
```

Playwright 测试可以并行执行，截图和 trace 文件隔离存储，不会相互覆盖。

### 安全的合并策略

传统方式直接合并到 main 分支，冲突在 main 分支解决，容易污染主干代码。

Worktree 方式采用 rebase 策略，冲突在 feature 分支内解决。

```
feature/auth 分支
    ↓ git rebase main
feature/auth 分支 (包含所有 main 的最新变更)
    ↓ 解决冲突 (在 feature 分支内)
feature/auth 分支 (冲突已解决)
    ↓ git merge --ff-only
main 分支 (快速前进，干净合并)
```

main 分支始终保持干净状态，冲突解决在 feature 分支完成，解决后可重新验证。

## 多特性并行开发

### 并行控制机制

Feature Workflow 通过 `queue.yaml` 管理需求队列，`config.yaml` 控制并行数量。

```yaml
# config.yaml
parallelism:
  max_concurrent: 2              # 最多同时开发 2 个需求

# queue.yaml
active:
  - id: feat-auth
    name: 用户认证
    priority: 90
    worktree: ../OA_Tool-feat-auth
    branch: feature/auth
    status: implementing

  - id: feat-dashboard
    name: 仪表盘
    priority: 80
    worktree: ../OA_Tool-feat-dashboard
    branch: feature/dashboard
    status: implementing
```

只有 active 数量小于 max_concurrent 时，才能从 pending 启动新需求。依赖关系确保前置需求完成后才能启动后续需求。

## 多 Agent 并行架构

### 主从式 Agent 设计

Feature Workflow 采用主从式 Agent 架构实现多特性并行开发。

```
┌─────────────────────────────────────────────────────────────┐
│ 主 Agent (无状态，可恢复)                                    │
│                                                              │
│ 职责：                                                        │
│ 1. 读取 queue.yaml 获取 active features                     │
│ 2. 检查每个 .status 文件判断当前状态                         │
│ 3. 启动独立的 Feature Agent 进程                             │
│ 4. 监控进度，处理阻塞和错误                                   │
└─────────────────────────────────────────────────────────────┘
         │ 启动独立进程
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Feature Agent (独立进程，自治)                               │
│                                                              │
│ 生命周期：implement → verify → complete → 退出              │
│ 输出：.status 文件 + .log 文件                              │
└─────────────────────────────────────────────────────────────┘
```

### 代码冲突解决方案

### 物理隔离避免冲突

Worktree 机制从根本上避免了开发时的冲突。

```
传统方式 (同一工作目录):
┌─────────────────────────────────────┐
│ OA_Tool/                            │
│  └── src/                           │
│      ├── auth.ts    ← Agent A 修改  │
│      └── dash.ts    ← Agent B 修改  │
└─────────────────────────────────────┘
问题：两个 Agent 同时修改 src/utils.ts

Worktree 方式 (独立工作目录):
┌─────────────────────────────────────┐
│ OA_Tool-feat-auth/                  │
│  └── src/auth.ts    ← Agent A       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ OA_Tool-feat-dashboard/             │
│  └── src/dash.ts    ← Agent B       │
└─────────────────────────────────────┘
优势：两个 Agent 操作不同文件副本
```

### 依赖关系管理

通过 dependencies 字段管理需求间的依赖关系，只有所有依赖都已完成才能启动。

### 合并前冲突检测

在 `complete-feature` 流程中加入合并前冲突检测。冲突在 feature 分支内解决，解决后可以重新运行测试验证。main 分支始终保持干净状态。

## 相关资源

- [Feature Workflow 源码](https://github.com/auenger/AILock-Step/tree/main/feature-workflow-LockStep)
- [AILock-Step 协议文档](https://github.com/auenger/AILock-Step)
- [OA_Tool 项目实践](https://github.com/auenger/OA_Tool)
