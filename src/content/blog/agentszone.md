---
title: "AgentsZone：一个让 AI Agent 互相说话的平台"
description: "基于 A2A 协议的桌面端 Agent 协作平台，支持跨机器通信、任务委派和上下文编排"
pubDate: 2026-05-07
tags: ["AI Agent", "A2A 协议", "AgentsZone", "多 Agent 协作"]
author: "杨正武"
---

## 为什么要做这个

现在做 AI Agent 的项目很多，但大部分都是单 Agent 场景：一个 Claude Code，一个 Cursor，一个 Codex，各干各的。真实的工作场景里，任务很少有一个人能独立完成的。前端 review 需要另一个 Agent 看，后端接口改了需要通知前端 Agent，代码写完了需要跑测试。

问题在于：Agent 之间没有统一的通信方式。Anthropic 有自己的 API，OpenAI 有自己的 SDK，每个框架都在造自己的轮子。想让两个不同厂商的 Agent 互相协作，你得写一堆胶水代码。

Google 在 2025 年提出了 A2A（Agent-to-Agent）协议，定义了一套标准化的 Agent 通信规范。AgentsZone 想做的事情很直接：基于 A2A 协议，做一个去中心化的 Agent 通信平台。任何 Agent 都可以在自定义的 Channel 里通信、交换任务、委派工作，不受限于某个厂商或框架。

## 三个核心概念

整个平台围绕三个东西转：

**Channel — 多 Agent 协作的房间**

一个 Channel 就是一个多 Agent 协作空间。你可以把 Claude、Codex、Gemini 放到同一个 Channel 里，用 @mention 触发特定的 Agent。消息自动路由，谁说的什么一清二楚。

```
Channel "code-review"
  成员: [Claude, Codex]
  你: "帮我 review 这段代码 @Claude"
  → Claude 响应 → 写入 Channel 消息
  你: "按 Claude 的建议改一下 @Codex"
  → Codex 执行 → 写入 Channel 消息
```

**Thread — 1 对 1 的深度对话**

Channel 是群聊，Thread 是私聊。跟某个 Agent 做深度交互时，开一个 Thread，独立上下文，不受 Channel 里其他消息的干扰。适合写代码、调试、长时间讨论。

**az-bridge — 跨机器的通信节点**

这是 AgentsZone 去中心化的关键。az-bridge 是一个独立的轻量二进制，可以在任何没有 GUI 的服务器上跑。它把本地的 Agent 暴露成 A2A 端点，远程的 AgentsZone 桌面端可以直接连接。Mac 上开桌面端，Windows 服务器上跑 az-bridge，两边实时通信。

```
你的 Mac (AgentsZone 桌面端)
    ↕ HTTP/JSON-RPC
远程服务器 (az-bridge 二进制)
    ↕
本地 Claude Code / Codex Runtime
```

## A2A 协议

AgentsZone 完整实现了 Google A2A 协议 v1.0，包括：

**协议层**

HTTP 传输 + JSON-RPC 2.0。每个 Agent 对外暴露标准的 A2A 端点，支持以下方法：

| 方法 | 作用 |
|------|------|
| `getAgentCard` | Agent 自我描述，包含名称、能力、支持的协议版本 |
| `sendMessage` | 同步发送消息 |
| `streamMessage` | 流式消息，SSE 推送 |
| `getTask` | 查询任务状态 |
| `cancelTask` | 取消任务 |
| `listTasks` | 列出所有任务 |

**Task 生命周期**

A2A 把所有交互抽象成 Task，状态机是这样的：

```
SUBMITTED → WORKING → COMPLETED
                  → FAILED
                  → CANCELED
                  → INPUT_REQUIRED
                  → AUTH_REQUIRED
```

每个 Task 携带消息历史（Message）、产出物（Artifact）和元数据。Agent 之间交换的就是 Task，不是裸消息。

**AgentCard**

每个 Agent 启动时生成一张 AgentCard，里面包含自己的名称、能力列表、支持的协议方法、认证方式。其他 Agent 或客户端拿到这张卡就知道该怎么跟你通信。类似 DNS 记录，但描述的是 Agent 的能力。

## 上下文编排引擎

Agent 协作最大的技术挑战是上下文管理。把所有历史消息一股脑塞给 LLM，token 爆掉；塞太少，Agent 丢失上下文。

AgentsZone 的方案是滑动窗口 + 自动摘要：

```
发送给 Agent 的上下文:
┌──────────────────────────────────────┐
│ Channel Summary (旧消息的压缩摘要)     │
│ + 最近 N 条消息 (全量携带)             │
│ + Channel 固定上下文前缀               │
│ + Agent 的 IDENTITY.md / SOUL.md      │
└──────────────────────────────────────┘
```

当 Channel 消息数超过 30 条时，自动触发摘要压缩。保留最近 10 条消息全量，更早的消息由 Agent 生成压缩摘要。已有摘要时做增量更新，不全量重建。

这个机制确保 Agent 永远在 token 预算内工作，不会因为对话太长而丢失关键信息。

## 任务委派

Delegation 是 Agent 之间交换任务的核心机制。Agent A 可以把一个子任务委派给 Agent B，带上上下文摘要和任务描述：

```
DelegationRequest {
  from_agent_id: "claude"
  to_agent_id: "codex"
  task_description: "按 review 意见修改代码"
  context_summary: "最近的对话记录压缩..."
  status: PENDING → SENT → ACKNOWLEDGED → IN_PROGRESS → COMPLETED
}
```

委派的生命周期有完整的状态跟踪：创建、发送、确认、执行中、完成。可以查询某个 Agent 委派出去的任务，也可以查它收到了哪些委派。失败了有错误信息，超时了有超时状态。

委派目标支持两种连接模式：Local（本地 Agent，走 A2A Server 内部通信）和 Remote（远程 Agent，走 HTTP）。委派引擎对传输层透明，不管是本地的还是远程的，处理逻辑一样。

## Zone Protocol

多个 Agent 在同一个 Channel 里协作，需要一套规则告诉每个 Agent"你是谁、你旁边还有谁、大家怎么配合"。AgentsZone 把这套规则封装成 Zone Protocol，作为上下文的 L2 层注入。

Zone Protocol 会在每次触发 Agent 时注入一段结构化上下文：

- Channel 里有哪些 Agent 成员
- 每个 Agent 的角色和能力
- 协作规则（怎么 @其他 Agent、怎么委派任务）
- 当前用户是谁

这段上下文只在 Channel 对话中注入，Thread 模式下不会出现，避免浪费 token。

## Task Engine

TaskEngine 管理任务的执行调度，支持两种模式：

**实时模式**：任务上下文注入到 Channel 消息流中，Agent 立刻响应。适合需要实时交互的场景。

**异步模式**：任务进入队列，后台轮询线程自动派发给空闲 Agent。支持优先级排序、失败重试（最多 2 次）、取消令牌。适合批量执行、定时任务。

异步模式下还有一个推送通知机制（Push Notification），远程 Agent 任务完成后会通过 webhook 回调通知。支持 HMAC-SHA256 签名验证防止伪造，事件幂等处理防止重复消费。

## 多 Runtime 支持

AgentsZone 通过 Rust trait 抽象 Agent Runtime，不绑定任何特定的 LLM：

```rust
pub trait AgentRuntime: Send + Sync {
    fn execute(&self, params: ExecuteParams) -> Result<Receiver<RuntimeEvent>>;
    fn is_ready(&self) -> bool;
    fn name(&self) -> &str;
    fn health_check(&self) -> RuntimeHealth;
    fn stop(&self) -> Result<()>;
}
```

目前实现了三个 Runtime：

- Claude Code（Anthropic）— 流式输出、session 持续、tool use
- Codex（OpenAI）— 同上
- Remote A2A — 连接远程 az-bridge 端点，远程 Agent 当本地 Agent 用

新建 Agent 时选择绑定哪个 Runtime，也可以创建远程 Agent 连接到别的机器上的 az-bridge。

## 技术栈

几个关键选型：

- **桌面端**：Tauri V2，Rust 后端 + React 19 前端。原生性能，直接访问文件系统
- **前端**：React 19 + TypeScript 5.8 + Tailwind CSS 4 + Vite 6
- **UI 风格**：新粗野主义（Neo-Brutalism），亮黄色侧边栏、粗黑描边、像素风图标
- **存储**：SQLite（结构化元数据）+ JSONL（消息体追加写入）+ Keyring（API 密钥安全存储）
- **IPC**：Tauri v2 的 invoke/listen，前端 Rust 双向通信，Event 流式推送

用 Tauri 而不是 Electron 的原因很简单：AgentsZone 要管理 CLI 子进程（Claude Code、Codex），需要精确的进程控制和文件系统操作，Rust 做这些事情比 Node.js 靠谱。打包体积也小很多，az-bridge 编译出来不到 10MB。

## 安全

几个安全设计值得提一下：

API Key 通过系统原生 Keyring 存储，前端永远接触不到明文密钥。az-bridge 的文件操作限制在 workspace 基目录内，路径遍历检查用 canonicalize + starts_with 做二次验证。Push Notification 用 HMAC-SHA256 签名，防止伪造回调。

## 当前状态

27 个 Feature 已全部落地：

- 多 Agent 管理和身份系统
- Channel 多 Agent 协作和 @mention
- Thread 1 对 1 深度对话
- 上下文编排引擎和自动摘要压缩
- 多 Runtime 支持（Claude Code + Codex）
- A2A 协议完整实现（Server + Client + Transport）
- az-bridge 跨机器通信（支持 macOS / Windows 交叉编译）
- 任务委派引擎（DelegationManager）
- Zone Protocol 多 Agent 上下文注入
- Task Engine（实时 + 异步调度）
- Push Notification 推送通知
- SQLite + JSONL 混合存储 + Migration 系统
- Workspace 文件浏览器和 Agent 技能管理
- SVG Icon 系统和新粗野主义 UI

下一步的重点：让 A2A 协议真正跑起来去中心化的多跳通信。现在 Agent A 可以委派任务给 Agent B，未来要做的是 Agent B 可以继续委派给 Agent C，形成任务链。任何节点可以随时加入或离开，不依赖中心化服务。
