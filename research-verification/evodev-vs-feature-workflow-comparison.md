# EvoDev 论文 vs Feature-Workflow 实践：FDD 概念映证分析

> 分析日期：2026-05-11
> 对照对象：
> - 论文：EvoDev (arXiv:2511.02399) — FDD 灵感的迭代式端到端软件开发框架
> - 实践：`company-ai-marketplace/plugins/feature-workflow` — 插件化特性驱动开发工作流
> - 归档：`HS_jarvis/features` — 55个已完成特性的结构化归档

---

## 一、核心概念对照表

| EvoDev 论文概念 | Feature-Workflow 实现 | 映证程度 |
|---|---|---|
| Feature-Driven Development (FDD) | 整个 workflow 以 Feature 为核心组织单元 | **完全一致** |
| Feature Map (DAG) | `queue.yaml` + `archive-log.yaml` + spec 中的 dependencies 字段 | **高度吻合** |
| 特性分解 (Feature Decomposition) | `/new-feature` + `/split-feature` 智能拆分 | **完全一致，且更成熟** |
| 依赖建模 (Dependency Modeling) | spec.md 中显式声明 `dependencies: [feat-xxx]` | **完全一致** |
| 三层上下文传播 | spec.md 的分层结构实现了等价机制 | **结构等价** |
| 迭代式开发 (Iterative Development) | `/dev-agent` 自动循环调度 | **完全一致** |
| 全局总体设计 (Overall Design) | `project-context.md` + 父特性 module index | **等价实现** |
| 多智能体协作 (Multi-Agent) | DevSubAgent 独立 200k context + 并行调度 | **完全一致** |
| 特性内上下文管理 | 三文档体系 (spec/task/checklist) + evidence | **更完善** |

---

## 二、逐项深度对照

### 2.1 FDD 五阶段映射

EvoDev 论文将 FDD 五阶段抽象为三阶段，Feature-Workflow 实现了等价映射：

```
FDD 经典五阶段              EvoDev 三阶段              Feature-Workflow
─────────────────────     ──────────────────        ──────────────────────
1. Build Overall Model  → Overall Design         → /init-project + project-context.md
2. Build Features List  → Feature Map Generation  → /new-feature + /split-feature
3. Plan by Feature      → Feature Map Generation  → queue.yaml 依赖排序
4. Design by Feature    → Iterative Development   → spec.md 技术方案 + task.md
5. Build by Feature     → Iterative Development   → /implement-feature + /verify-feature
```

**关键一致性**：
- 两者都遵循"先全局设计 → 再特性分解 → 按依赖迭代开发"的流程
- 两者都要求在开发前完成总体设计（EvoDev: Overall Design; FW: project-context.md）
- 两者都按依赖关系确定开发顺序

### 2.2 Feature Map 对比

#### EvoDev 的 Feature Map

论文中的 Feature Map 是一个 DAG，每个节点包含三层上下文：

```
Feature Map (DAG)
├── Feature Set A ←── Business-layer Context (功能范围 + 接口)
│                   ├── Design-layer Context (UI 组件 + 数据实体)
│                   └── Implementation-layer Context (代码变更记录)
├── Feature Set B ←── depends on A
│                   ├── Business-layer
│                   ├── Design-layer
│                   └── Implementation-layer
└── Feature Set C ←── depends on A, B
```

#### Feature-Workflow 的等价结构

Feature-Workflow 没有一个单一的 DAG 文件，但通过三个文件的组合实现了**功能等价**：

**① queue.yaml = 动态 DAG 边（调度视图）**
```yaml
pending:
  - id: feat-auth
    dependencies: []
  - id: feat-payment
    dependencies: [feat-auth]     # ← DAG 边

blocked:
  - id: feat-dashboard
    dependencies: [feat-redesign-layout]  # ← DAG 边
```

**② archive-log.yaml = 历史 DAG（已完成节点）**
```yaml
archived:
  - id: feat-redesign-timeline
    dependencies: [feat-redesign-layout]  # ← 已验证的 DAG 边
    parent: feat-board-redesign           # ← 层级关系
    verification:
      scenarios_total: 3
      scenarios_passed: 3
```

**③ spec.md = 节点内部三层上下文**

| EvoDev 层 | spec.md 等价字段 |
|---|---|
| Business-layer | `Description` + `User Value Points` + `Acceptance Criteria (Gherkin)` |
| Design-layer | `Technical Solution` + `Context Analysis` (参考代码、相关文档) |
| Implementation-layer | `Merge Record` + `evidence/verification-report.md` |

**实际归档中的依赖 DAG（从 archive-log.yaml 提取）：**

```
feat-redesign-system (设计令牌基础)
  └→ feat-redesign-layout (全局布局)
       ├→ feat-redesign-timeline (Timeline 重设计)
       ├→ feat-redesign-knowledge-map (知识图谱重设计)
       └→ feat-redesign-explorer (浏览器重设计)

feat-p3-governance-engine (治理引擎)
  └→ feat-p3-board-ecosystem (生态集成)
       depends: [feat-p3-governance-engine, feat-board-redesign]

feat-p3-obsidian-vault
  └→ feat-obsidian-runtime-integration
```

**结论：两者在依赖建模上完全同构。** Feature-Workflow 用 YAML + Markdown 组合实现了 EvoDev 用 DAG + JSON 描述的同一结构。

### 2.3 特性分解策略对比

#### EvoDev
- Feature Extractor agent 分解需求为特性列表
- Feature Planner agent 按内聚性分组为 Feature Sets
- 每个 Feature Set 可独立实现
- 约束：最多 4 个 Feature Sets

#### Feature-Workflow
- `/new-feature`：AI 分析识别用户价值点，3+ 价值点时建议拆分
- `/split-feature`：按业务领域拆分（非技术层），父特性转为 module index
- 拆分标准：每个子特性可独立交付 + 清晰数据边界 + 目标 S/M 规模

**关键差异与优势**：

| 维度 | EvoDev | Feature-Workflow |
|---|---|---|
| 拆分粒度控制 | Feature Planner 自动分组，上限 4 组 | 人工确认 + AI 建议，灵活调整 |
| 拆分后父特性 | 未明确处理 | 转为 module index（只读索引） |
| 拆分标准 | 功能内聚 + 保持依赖 | **按用户价值**而非技术层 |
| 下游依赖管理 | 未详细说明 | 明确保持下游对父特性的依赖 |

**Feature-Workflow 在拆分策略上更成熟**：父特性转索引的机制是 EvoDev 未涉及的创新点。

### 2.4 上下文管理与传播对比

这是论文的核心贡献之一，也是映证最深刻的部分。

#### EvoDev 的上下文传播机制

```
Feature A 完成 → 更新 Implementation-layer Context (代码变更)
                → 通过依赖关系传播到 Feature B
                → Feature B 获得业务 + 设计 + 实现三层上下文
```

#### Feature-Workflow 的等价机制

```
Feature A 完成 → /complete-feature 归档到 archive/
               → archive-log.yaml 记录 stats (commits, files_changed)
               → evidence/ 保存 verification-report.md

Feature B 启动 → /start-feature 读取 spec.md
               → Context Analysis → Related Features 引用已完成特性
               → 可通过 /query-archive 深度加载历史实现细节
               → project-context.md 提供全局技术栈上下文
```

**spec.md 中 `Context Analysis` 的三层映射**：

```
EvoDev                      spec.md 字段
─────────────               ─────────────────────────────────
Business-layer Context  ←→  Description + User Value Points
Design-layer Context    ←→  Technical Solution + Related Documents
Implementation-layer    ←→  Reference Code + Related Features + Archive Patterns
```

**上下文传播路径实例**（取自 `feat-redesign-layout` 的 spec.md）：

```markdown
### Related Features
- feat-redesign-system (前置) — 提供 Bento Grid 设计令牌和 shadcn/ui 组件
- feat-p2-board-scaffold (已完成) — 建立了当前 layout.tsx，需完全重写
- feat-p2-e2e-playwright (已完成) — E2E 测试中有页面导航断言，布局变更需更新

### Archive Implementation Patterns
- 当前布局: Sidebar 使用 position: fixed w-60
- 页面路由: / /services /artifacts /knowledge-map /timeline
- WebSocket 状态: 当前在 Sidebar 底部显示
```

这正是 EvoDev 论文描述的"通过依赖关系传播设计层和实现层上下文"的实际体现。

### 2.5 多智能体协作对比

#### EvoDev
- 6 种 agent：Business Analyst, Architect, Feature Extractor, Feature Planner, Chief Programmer, Programmer
- 每个 agent 有明确职责边界
- Programmer agent 有内存优化机制（file_contents 缓存）

#### Feature-Workflow
- 2 层 agent：`/dev-agent`（调度层）+ DevSubAgent（执行层，独立 200k context）
- DevSubAgent 通过 Skill Tool 调用 15 个原子 skill
- 支持 `max_concurrent` 并行执行多个特性

**对比**：

| 维度 | EvoDev | Feature-Workflow |
|---|---|---|
| Agent 数量 | 6 个专精 agent | 1 个通用 SubAgent + 15 个 skill |
| 职责划分 | 按 FDD 阶段分 agent | 按开发阶段分 skill |
| 并行能力 | 顺序执行特性集 | 多 SubAgent 并行（max_concurrent） |
| 隔离级别 | 共享 Feature Map 状态 | 物理隔离（独立 worktree + 200k context） |
| 容错 | 论文未详述 | SubAgent 超时保护 + 自动重试 + 状态恢复 |

**Feature-Workflow 在工程化上更成熟**：
- 物理隔离（worktree）比 EvoDev 的逻辑隔离更安全
- 并行开发能力是 EvoDev 未重点讨论的
- 15 个原子 skill 的可组合性比 6 个固定 agent 更灵活

### 2.6 质量保证对比

#### EvoDev
- 自动构建 + 错误反馈循环
- 人工评估（4 人 Likert 量表）
- 构建/调试双阶段

#### Feature-Workflow
- Gherkin 验收场景自动验证
- `/verify-feature --auto-fix` 自动修复
- `evidence/verification-report.md` 证据留存
- 三文档体系：spec → task → checklist 逐步收窄

---

## 三、Feature-Workflow 相对 EvoDev 的创新点

通过对照分析，Feature-Workflow 在以下方面**超越了论文描述**：

### 1. 物理隔离（Worktree-Based Isolation）
EvoDev 在同一代码仓库中顺序开发特性。Feature-Workflow 为每个特性创建独立 git worktree，彻底消除并行开发时的文件冲突风险。

### 2. 父特性 Module Index 机制
`/split-feature` 将拆分后的父特性转为只读索引（含子特性表格 + 依赖图），这是 EvoDev 的 Feature Map 未涉及的**组织模式创新**。

### 3. 三文档递进收窄
```
spec.md (What - 宽泛定义)
  → task.md (How - 实现路径)
    → checklist.md (Done - 验收标准)
```
这比 EvoDev 的 Feature Specification Schema 更有层次感，实现了从需求到验收的渐进式细化。

### 4. 归档即知识积累
`archive-log.yaml` + `evidence/` 构成了组织级知识库，每个特性的实现细节、耗时、验证结果都被完整保留。EvoDev 聚焦于开发过程本身，未讨论完成后的知识沉淀。

### 5. 插件化分发
作为 `company-ai-marketplace` 的标准插件，可以跨项目复用。EvoDev 是一个研究原型，未考虑工业化分发。

---

## 四、EvoDev 相对 Feature-Workflow 的启发价值

尽管 Feature-Workflow 在工程化上更成熟，EvoDev 论文提供了理论框架层面的启发：

### 1. Feature Map 的形式化描述
论文将依赖关系明确为 DAG，并形式化了三层上下文模型。Feature-Workflow 虽然实现了等价功能，但缺乏这种形式化表达。可以考虑：
- 从 queue.yaml + archive-log.yaml 自动生成可视化 DAG
- 为 spec.md 的三层上下文建立更明确的元数据 schema

### 2. 上下文传播的形式化
论文精确描述了"信息沿依赖关系流动"的机制。Feature-Workflow 依赖 AI 理解 Related Features，可以考虑：
- 在 `/start-feature` 时自动注入所有前置特性的实现摘要
- 建立显式的"上下文传播日志"

### 3. 模型行为与工作流对齐
论文发现 Claude 系列倾向于"多轮自编辑和修复"，与迭代工作流产生冲突（提前实现后续迭代的特性）。Feature-Workflow 的 DevSubAgent 同样可能遇到此问题，值得在 prompt 设计中加以防范。

---

## 五、总结

### 映证结论

**Feature-Workflow 与 EvoDev 在 FDD 核心理念上高度一致，且在工程实践上更为成熟。**

1. **FDD 方法论映证**：两者都遵循 FDD 五阶段流程，抽象层次一一对应
2. **Feature Map 映证**：queue.yaml + archive-log.yaml + spec.md 的组合实现了 EvoDev Feature Map 的等价功能
3. **三层上下文映证**：spec.md 的 Description / Technical Solution / Reference Code 映射到论文的 Business / Design / Implementation 三层
4. **依赖 DAG 映证**：从 55 个归档特性中提取的依赖关系图与论文描述的 DAG 结构同构

### 映证评级

| 维度 | 评级 | 说明 |
|---|---|---|
| 方法论一致性 | ★★★★★ | 完全遵循 FDD，阶段映射清晰 |
| Feature Map 等价性 | ★★★★☆ | 功能等价，但缺形式化 DAG 可视化 |
| 上下文传播 | ★★★★☆ | 实际有效，但依赖 AI 理解而非显式注入 |
| 依赖建模 | ★★★★★ | 显式声明 + 自动解析 + 阻塞管理 |
| 迭代开发 | ★★★★★ | 自动循环 + 并行 + 超时保护 |
| 质量保证 | ★★★★★ | Gherkin + evidence + 三文档递进 |
| 知识积累 | ★★★★★ | 归档体系远超论文范围 |
| 工程化程度 | ★★★★★ | 物理隔离 + 插件化 + 状态管理 |

**总评：Feature-Workflow 是 EvoDev 论文所述 FDD + Feature Map 方法论的完整工程化实现，且在多个维度上有所超越。55 个已完成特性的归档数据本身就是这一方法论有效性的实证。**
