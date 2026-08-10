# 回归防护体系：归档记忆 + 自动关联 + 上下文注入

> 解决的核心问题：不管是 bug fix 还是 feature，无意间破坏了过去的功能。

## 核心思路

**不让 Agent 在"失忆"状态下开发。** 每个 feature 完成后的经验不是丢掉，而是结构化地沉淀，并在后续工作中自动被唤醒。

## 三层防护链路

```
Feature A 完成
    │ complete-feature: 写入 archive-log.yaml（keywords/category/related/verification）
    │ 拷贝完整文档到 done-{id}/
    ▼
Feature B 创建
    │ new-feature: 扫描 archive-log.yaml → 发现与 A 相关 → 自动填充依赖字段
    ▼
Feature B 开发
    │ start-feature: 深度加载 A 的 spec/task/checklist
    │ implement-feature: Agent 在知晓 A 的实现上下文下编写代码
    ▼
Feature B 合并
    │ complete-feature: 检测与 A 的冲突 → 记录冲突 → 验证通过后才归档
    ▼
归档 → 成为下一轮 Feature C 的历史上下文
```

---

## 第一层：完成时 — 结构化归档记录

**Skill：`/complete-feature`**

feature 完成时不是简单打个 tag 就结束，而是往 `archive-log.yaml` 写入一份**可搜索的索引元数据**。

### 索引结构

```yaml
archived:
  - id: feat-auth
    name: User Authentication
    completed: "2026-03-02T14:30:00"
    tag: feat-auth-20260302
    merge_commit: "abc1234"

    # --- 索引元数据（支持关键词搜索，无需加载完整归档）---
    keywords: [auth, login, jwt]
    category: backend
    value_points: 3
    related_features: [feat-session, feat-rbac]

    # --- 验收与冲突 ---
    verification:
      status: passed
      scenarios_total: 8
      scenarios_passed: 8
    conflicts:
      had_conflict: false

    # --- 开发统计 ---
    stats:
      started: "2026-03-01T09:00:00"
      duration: "2d 5h"
      commits: 12
      files_changed: 8
```

### 关键字段说明

| 字段 | 来源 | 作用 |
|---|---|---|
| `keywords[]` | 自动提取：feature 名称分词、spec 价值点关键词、task 中的文件路径/API 名称 | 搜索索引，支持后续 feature 关联匹配 |
| `category` | 自动分类：backend / frontend / fullstack / infra / docs / refactor | 按领域过滤，缩小关联搜索范围 |
| `value_points` | 从 spec.md 用户价值点计数 | 衡量功能体量，辅助规模评估 |
| `related_features[]` | spec 依赖字段 + 相关历史需求 + 父子关系 | 双向追踪：写入时反向更新被关联的归档记录 |
| `verification` | verify-feature 的验收结果 | 保留通过场景数，后续可参考验收标准 |

### 完整文档归档

除索引外，以下文档一并拷贝到 `features/archive/done-{id}-{date}/`：

- `spec.md` — 需求规格
- `task.md` — 任务分解与实现记录
- `checklist.md` — 验收清单
- `evidence/` — 验收证据（如存在）

即使物理文件丢失，所有文档可通过 git tag 恢复：`git show {tag_name}:path/to/file`。

---

## 第二层：创建时 — 自动搜索历史关联

**Skill：`/new-feature`（Step 1.5: Search Related Archives）**

创建新 feature 时，自动扫描归档索引，将历史上下文注入创建流程。

### 执行步骤

1. **读取索引**：加载 `features/archive/archive-log.yaml`
2. **提取关键词**：从新 feature 的名称和描述中提取关键词
3. **多维度匹配**（大小写不敏感）：
   - Feature `name` 和 `id` 与关键词匹配
   - 归档 `keywords[]` 与关键词交集匹配
   - `related_features[]` 双向依赖匹配
4. **呈现匹配结果**（Level 1 索引元数据，不深度加载）：

```
Related archived features found:

  feat-auth | User Authentication | 2026-03-02
    keywords: [auth, login, jwt] | category: backend | value_points: 3

  feat-rbac | Role-Based Access | 2026-03-10
    keywords: [rbac, role, permission] | category: backend | value_points: 2
```

5. **自动填充**：匹配强度高时，自动填入 spec.md 的 Dependencies 和 Related Features 字段

### 设计约束

创建阶段只做 Level 1（索引扫描），**不触发 Level 2 SubAgent 深度加载**，避免污染创建阶段的上下文窗口。

---

## 第三层：启动时 — 依赖上下文深度注入

**Skill：`/start-feature` + `/query-archive`（渐进式加载）**

真正开始开发时，通过渐进式加载机制按需获取相关归档的完整上下文。

### 渐进式加载架构

```
query-archive（主上下文）
    │
    ├─ Level 1: 读 archive-log.yaml（~KB，索引层）
    │   → 关键词 / 分类 / 日期 / 关联 过滤
    │   → 返回快速概览（仅元数据）
    │
    └─ Level 2: SubAgent 深度加载（独立 200k 上下文，不污染主对话）
        │
        ├─ 读取 spec.md（需求规格）
        ├─ 读取 task.md（实现记录）
        ├─ 读取 checklist.md（验收清单）
        ├─ 读取 evidence/（验收证据，如存在）
        └─ 返回结构化摘要（KB 级）
```

### 查询方式

| 过滤条件 | 说明 |
|---|---|
| `--keyword <term>` | 模糊匹配 keywords[]、name、id |
| `--category <cat>` | 精确匹配 category |
| `--related <id>` | 双向匹配 related_features[] |
| `--since <date>` | completed >= 日期 |
| `--id <id>` | 精确匹配 id（触发 Level 2 深度加载） |

无过滤条件时，返回最近 10 条归档。

### 效果

Agent 在动手写代码前，已经知道了过去相关 feature 的：

- 需求是什么（spec）
- 怎么实现的（task 实现记录）
- 怎么验收的（checklist + Gherkin 场景）
- 有没有遇到过冲突（conflict 记录）

---

## 对比：有无回归防护

| 场景 | 没有这套机制 | 有这套机制 |
|---|---|---|
| 历史感知 | Agent 不知道之前改了什么，盲写代码 | 创建时自动发现历史关联，开发前加载上下文 |
| 影响面分析 | 改了 auth 模块不知道 feat-session 依赖它 | related_features 双向追踪，依赖关系可查 |
| 冲突预防 | 冲突在 merge 时才发现，为时已晚 | 相关功能的 spec/测试场景在实现前就已加载 |
| 归档可用性 | 归档是不可搜索的黑盒 | keywords + category + value_points 构成可搜索索引 |
| 知识传递 | 每个 feature 从零开始 | 每次开发站在过去所有已完成 feature 的结构化记忆之上 |

---

## 相关文件

| 文件 | 作用 |
|---|---|
| `features/archive/archive-log.yaml` | 归档索引（渐进式加载的 Level 1） |
| `features/archive/done-{id}-{date}/` | 完整归档文档（Level 2 深度加载） |
| `feature-workflow/config.yaml` | 归档配置（tag 格式、自动关键词、分类列表、关联追踪） |
| `.claude/skills/new-feature/skill.md` | 创建时关联搜索逻辑（Step 1.5） |
| `.claude/skills/query-archive/skill.md` | 渐进式查询逻辑（Level 1 + Level 2） |
| `.claude/skills/complete-feature/skill.md` | 归档记录逻辑（Step 10: 元数据提取 + 写入） |
| `.claude/skills/start-feature/skill.md` | 启动时依赖上下文注入 |
| `.claude/skills/enrich-feature/skill.md` | 子 feature 充实时的归档加载 |
