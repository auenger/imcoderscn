---
title: "Edith：把代码变成 AI 可消费的知识"
description: "一个自动从代码中提取知识、生成纯 Markdown 的 AI 基础设施，让任何 Agent 都能直接消费"
pubDate: 2026-05-06
tags: ["AI Agent", "知识工程", "Edith", "工具"]
author: "杨正武"
---

## 为什么需要 Edith

做 AI Agent 开发久了，会遇到一个绕不过去的问题：Agent 要干活，就得先理解代码库。

现在常见的做法是什么？让 Agent 自己扫文件、grep 关键词、读 README。一个中型项目几千个文件，Agent 每次开始工作都得把整个目录树过一遍，context 窗口撑到爆，还经常漏掉关键信息。换个 Agent 框架，同样的扫描再来一轮。

这就好比每个新员工入职第一天，都让他自己翻服务器上的所有文件夹来理解公司业务。没人这么干，但我们对 AI Agent 就是这么干的。

Edith 想解决的核心问题：**把代码库里的知识提前提取出来，组织好，让任何 Agent 拿到就能用，不需要安装任何东西，不需要适配任何框架。**

## 三层知识架构

Edith 最核心的设计是一个三层知识结构。

**Layer 0：routing-table.md（< 500 tokens）**

一张全局路由表。Agent 拿到这张表，就知道项目里有哪几个服务、每个服务负责什么、入口在哪。token 成本极低，但信息密度很高。

```markdown
## routing-table
| service | responsibility | entry |
|---------|---------------|-------|
| auth | 用户认证与权限 | src/auth/index.ts |
| payment | 支付与订单 | src/payment/handler.ts |
| notify | 消息推送 | src/notify/sender.ts |
```

**Layer 1：quick-ref.md（约占原始代码 5%）**

验证命令、环境约束、API 端点、关键配置。Agent 需要快速查阅的硬信息都在这里。不需要理解完整逻辑，只需要知道"怎么跑测试"、"数据库连哪个"、"端口是多少"。

**Layer 2：distillates/\*.md（无损压缩）**

按语义分片的知识文件。每个文件对应一个完整语义单元：接口定义、数据模型、业务逻辑、错误处理。这些是从源代码中蒸馏出来的，保留了所有必要信息，但去掉了实现细节中的噪声。

### 渐进式加载：索引不倾倒

为什么要分三层？因为 Agent 的 context 窗口是有限的。Edith 的原则是"索引不倾倒"，只加载完成任务所需的最小上下文，而不是全量推送。

具体加载流程是这样的：

```
Agent 启动任务
  ↓
Layer 0 路由表（常驻，< 500 token）
  → 确定涉及哪些服务
  ↓
Layer 1 速查卡（涉及哪个服务就加载哪个，< 2000 token）
  → 知道验证命令、约束、易错点
  ↓ 还不够？
Layer 2 蒸馏片段（按需加载特定片段，< 1000 token/片段）
  → 查具体接口契约、数据模型细节
  ↓
开始工作
```

大部分日常任务在 Layer 1 就够了。改个接口、修个 bug，加载一张速查卡就能开工。只有涉及跨服务变更、数据模型大改这种复杂场景，才需要深入 Layer 2。

这里有个关键设计：每次加载哪个层级、加载哪些服务，不是用户手动指定的。Edith 内置了一个需求路由器（requirement-router），它会先分析任务描述，自动判断这次任务涉及哪些服务、需要加载到哪个层级。四种路由决策：

| 决策 | 场景 | 加载策略 |
|------|------|----------|
| direct | 单服务 CRUD、新增微服务 | 无额外加载，路由表就够 |
| quick-ref | 改接口、重构、事故排查 | 加载 1 个速查卡 |
| multi-service | 跨服务联调、数据同步 | 加载 N 个速查卡 |
| deep-dive | 改 Schema、数据模型变更 | 速查卡 + 具体蒸馏片段 |

渐进式加载带来的效果很直接：token 消耗降一个数量级，Agent 的 context 窗口不再被无关信息占满，留给实际工作的空间更多了。

## 六个工具

Edith 通过六个核心工具把代码转化成知识：

| 工具 | 干什么 |
|------|--------|
| `scan` | 深度扫描代码，自动选择扫描深度（小项目全扫，大项目分模块） |
| `distill` | 五步无损压缩流水线，带冲突检测 |
| `route` | 生成路由表，分析服务复杂度 |
| `query` | 跨平台路径感知的查询 |
| `explore` | 浏览项目结构 |
| `subagent` | 委派子任务，支持并行和链式执行 |

整个流程是一条流水线：scan → distill → route → query。先用 scan 挖出代码里的知识，再用 distill 压缩成 Markdown，route 生成路由表，最后 query 支持按需检索。

### scan 的智能深度控制

这个值得单独说。大项目全量扫描是不现实的，Edith 会根据项目规模自动调整策略：

- 小型项目（< 100 文件）：全量扫描
- 中型项目（100-500 文件）：按模块深度扫描
- 大型项目/monorepo：逐模块边界扫描

scan 还能做到函数级分析：提取函数签名、依赖关系、识别设计模式。这些信息会直接进入 distill 阶段。

## 多模型支持

Edith 接了 7+ 个 LLM 提供商：DeepSeek、小米 MiMo、Anthropic、OpenAI、Ollama、MiniMax、智谱、Moonshot。统一的接口协议，支持热切换。

```bash
# 运行中随时切换模型
/model deepseek-chat
/model anthropic/claude-sonnet-4-6
/model ollama/qwen2.5-coder
```

为什么要接这么多？因为知识提取的活不一定需要最贵的模型。路由表的生成用 DeepSeek 就够了，复杂的业务逻辑蒸馏可能需要 Claude Sonnet。不同任务用不同模型，省钱。

## Context 监控

Edith 内置了 context 监控系统，实时追踪 token 消耗、context 压力、缓存命中率。

```
┌─ Context Monitor ─────────────────┐
│ Tokens: 12,340 / 128,000 (9.6%)  │
│ Pressure: LOW                     │
│ Cache Hit: 78%                    │
│ Active Tools: scan, distill       │
└───────────────────────────────────┘
```

这东西解决的是另一个痛点：Agent 在工作过程中你不知道它还有多少余量。context 快满了还没干完活，结果就是后半段输出质量直线下降。有了监控，Agent 可以主动触发 compact 或者切换策略。

## 斜杠命令

9 个命令覆盖了日常工作流：

- `/model` 切换模型
- `/new` 新会话
- `/clear` 清空上下文
- `/compact` 压缩上下文
- `/context` 查看 context 状态
- `/delegate` 委派子任务
- `/explore` 浏览项目
- `/status` 查看系统状态
- `/init` 初始化项目配置

## 技术栈

几个关键选型：

- **Agent 框架**：pi SDK（`@mariozechner/pi-coding-agent`），提供 AgentSession、多模型支持、Tool Calling、流式输出
- **终端 UI**：React + Ink，16 个组件化的 TUI 组件
- **配置**：edith.yaml，支持多 profile
- **语言**：TypeScript，跑在 Node.js >= 20 上

终端 UI 用 React + Ink 这个选择挺有意思的。做终端界面还能用组件化的方式写，复用性和可维护性比裸写 ncurses 好太多。

## Skill 产出

Edith 不只是产出一堆知识文件，它还把知识封装成三种可执行的 Skill，让任何 Agent 读到就能直接上手干活。

**Source Skill** — 数字资产的访问指南。告诉 Agent 去哪找什么、怎么搜、路由规则是什么。放在 `sources/<source-name>/README.md`。

**Repo Skill** — 单个仓库的工作手册。包含接口契约、数据模型、构建命令、关键约束。放在 `skills/<repo-name>/SKILL.md`。

**Workflow Skill** — 跨仓库业务流程的编排器。定义业务流程、阶段划分、集成点、成功标准。放在 `skills/<workflow-name>/SKILL.md`。

Skill 的生成管道：

```
document-project 扫描
  ↓ 生成原始项目文档
distillator 蒸馏压缩
  ↓ 生成三层知识产物
Skill Bootstrap
  ↓ 从蒸馏结果自动生成 Skill 种子
人工确认 + 真实工作回写
  ↓ 成长为成熟知识
```

注意 Skill 种子是骨架，不是成熟知识。Edith 会标注 `[未确认]` 来区分哪些是代码中提取的事实、哪些是推断。真正的成熟靠后续真实工作中的回写来积累。

所有 Skill 产出物都自带消费规则。任何 AI Agent 读取后自动获得相应能力，不需要额外培训。一次蒸馏，全员受益。

## 产出物的核心原则

几条贯穿整个设计的硬性规则：

**产出物永远是纯 Markdown。** 这是最重要的一条。Markdown 是所有 LLM 都能直接消费的格式，不需要额外的解析器或适配层。

**渐进式加载。** 三层结构 + 需求路由器，确保 Agent 只加载完成任务所需的最小上下文。不倾倒，不浪费。

**知识持续积累。** 每次扫描和蒸馏都是增量更新，组织级的知识只会越来越多，不会丢失。

**Agent 无关。** 不绑定任何特定的 LLM 或 Agent 框架。今天用 Claude，明天换 GPT，后天用本地 Ollama，知识产物完全一样。

## 实际体验

一个典型的使用流程：

```bash
# 1. 初始化项目
edith init

# 2. 扫描代码库
edith scan

# 3. 蒸馏知识
edith distill

# 4. 生成路由表
edith route
```

运行完之后，项目目录下会多出 `.edith/` 文件夹，里面就是三层知识产物。任何 Agent 只需要读这些 Markdown 文件，就能对项目有基本理解。

实际效果：一个有 2000+ 文件的中型项目，扫描 + 蒸馏大约 3-5 分钟（取决于模型和项目复杂度），最终产出的知识文件大概占原始代码量的 8-12%，但信息覆盖率超过 90%。Agent 基于这些知识工作，准确率比直接扫描源码高很多，token 消耗降了一个数量级。

## 当前状态

三个 Phase 已经全部落地：

- **Phase 1**：EDITH Agent MVP，38 个特性全部完成
- **Phase 2**：Next.js Web Dashboard，可视化管理和浏览知识产物
- **Phase 3**：增值功能，包括 Obsidian 集成、知识治理引擎、质量评分、成熟度追踪

如果你也在做 Agent 相关的开发，尤其是需要让 Agent 理解大型代码库的场景，可以试试 Edith。它的核心思路不复杂：提前把代码里的知识提取出来、组织好，Agent 拿到就能用。
