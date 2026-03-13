---
title: "AILock-Step 协议：解决 AI Agent 幻觉性跳步的工程实践"
description: "基于状态锚点（STP）的线性执行协议，实现 AI Agent 断点续传级开发"
pubDate: 2026-03-13
tags: ["AI Agent", "工程实践", "AILock-Step", "执行协议"]
author: "杨正武"
---

## 引言

在与 AI 协作开发时，会遇到几个典型问题。AI 看到循环任务时，会因为上下文窗口压力自动简化中间步骤，直接说剩余任务逻辑相似已省略。一旦生成中断，AI 很难找回执行进度。AI 可能在依赖未就绪时就开始实现相关功能，导致依赖混乱。AI 容易受代码注释或需求文档中感性描述的影响，产生偏离目标的逻辑。

为了解决这些问题，我设计了 AILock-Step 协议。这是一种基于状态锚点（STP）的线性执行协议。

## 核心设计

### 协议声明

AILock-Step 协议定义了一种基于状态锚点（STP）的线性执行逻辑。执行器必须严格遵守编号、判断、动作、跳转的单步逻辑。只有在收到明确的跳转指令后才能进入下一个状态锚点。

### 语法定义

```yaml
STP-[XXX]    : 状态锚点，执行指针停留在此处直到动作完成
?? [Condition]: 逻辑门控，条件为假时跳转至错误流
!! [Operator] : 原子算子，代表不可拆分的物理动作
>> [Target]   : 数据流向，将左侧算子的输出压入右侧寄存器
-> [Target_STP]: 强制跳转，唯一的逻辑演进路径
```

## 标准算子集

### 文件系统算子

`OP_FS_READ` 物理读取文件系统内容，路径不存在时返回空值。`OP_FS_WRITE` 写入或覆盖指定路径文件。`OP_FS_EXISTS` 检查路径是否存在。`OP_FS_DELETE` 删除指定文件或目录。

### Git 算子

`OP_GIT_STATUS` 获取当前 git 状态。`OP_GIT_COMMIT` 提交当前变更。`OP_GIT_WORKTREE_ADD` 创建 worktree。`OP_GIT_WORKTREE_REMOVE` 删除 worktree。

### 数据处理算子

`OP_ANALYSE` 将非结构化文档转化为结构化的 Key-Value 格式。`OP_GET_TOP` 从列表寄存器中取出第一个符合过滤条件的项。`OP_COUNT` 统计符合条件的项目数量。`OP_CODE_GEN` 基于上下文实现具体任务的代码。

### 状态同步算子

`OP_STATUS_UPDATE` 更新 .status 文件。`OP_TASK_SYNC` 同步 task.md 状态，标记为完成或待处理。`OP_EVENT_EMIT` 输出事件到日志。

## 方案优势

### 消除幻觉性跳步

传统方案中，AI 看到循环任务时会因为上下文窗口压力自动简化中间步骤。AILock-Step 协议禁止循环语义，AI 必须通过物理跳转重新扫描任务列表。每一轮跳转都是一次全新的状态对齐，强迫 AI 保持步骤完整性。

### 状态可追溯与中断恢复

传统方案中，一旦生成中断，AI 很难找回执行进度。AILock-Step 协议的每个状态锚点都关联寄存器和物理存盘点。即使执行中断，新会话只需读取 .status 文件即可精准定位指针，实现断点续传。

### 语义噪声屏蔽

传统方案中，AI 容易受代码注释或需求文档中感性描述的影响。AILock-Step 协议采用冷门符号逻辑。这会触发 AI 的指令解析模式而非文本续写模式，使其注意力集中在算子执行上，而非语义猜测。

### 严格的依赖管理

传统方案中，AI 可能在依赖未就绪时就开始实现相关功能。AILock-Step 协议通过状态锚点序列锁死执行路径。判断算子充当逻辑哨兵，如果前置任务未标记为完成，指针无法移动至下一阶段。

## 实际应用

在 OA_Tool 项目中，基于 AILock-Step 协议构建了完整的特性开发工作流。

### EVENT Token 规范

协议定义了标准的事件格式实现可观测性：

```
EVENT:START <feature-id>
EVENT:STAGE <feature-id> <stage>
EVENT:PROGRESS <feature-id> <done>/<total>
EVENT:BLOCKED <feature-id> <reason>
EVENT:COMPLETE <feature-id> <tag>
EVENT:ERROR <feature-id> <message>
EVENT:STP <feature-id> <stp-id>
```

## 总结

AILock-Step 协议通过状态锚点强制线性执行，消除幻觉性跳步。原子算子确保每个操作的幂等性和可追溯性。寄存器系统提供清晰的数据流转和状态管理。物理存盘实现真正的断点续传能力。符号逻辑屏蔽语义噪声，让 AI 专注于执行。

## 相关资源

- [AILock-Step 协议完整文档](https://github.com/auenger/AILock-Step)
- [OA_Tool 项目实践](https://github.com/auenger/OA_Tool)
- [MCP 协议文档](https://modelcontextprotocol.io)
