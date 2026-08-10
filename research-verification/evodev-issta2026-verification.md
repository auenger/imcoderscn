# EvoDev 论文信息验证报告

> 验证日期：2026-05-11

## 待验证原文

> 从"Task列表"到"特性地图"：特性驱动开发如何重塑AI Coding工作流？我们从经典软件工程中的特性驱动开发（FDD）方法中获得灵感，提出了一种特性驱动的迭代式端到端生成式软件开发框架EvoDev。该框架定义并实现了一套面向大模型智能体的结构化开发工作流：它不再将开发过程组织为线性的to-do列表，而是引入特性地图（Feature Map）作为演化式开发的核心组织结构，并在此基础上利用特性依赖关系统筹开发任务规划以及上下文管理与传播，从而实现持续的演化式应用开发能力。基于该研究工作的研究论文《EvoDev: An Iterative Feature-Driven Framework for End-to-End Software Development with LLM-based Agents》已被软件工程领域顶级国际会议 ISSTA 2026 接收。

---

## 验证结论总览

| 验证项 | 结果 |
|---|---|
| 论文真实性 | **确认** |
| 作者与机构 | **确认** |
| FDD灵感 + Feature Map 概念 | **确认** |
| ISSTA 2026 会议真实性 | **确认** |
| "已被 ISSTA 2026 接收" | **合理但无法独立验证** |
| "软件工程领域顶级国际会议" | **基本准确，ISSTA 是软件测试与分析子领域顶会** |

---

## 1. 论文真实性：确认

- **标题**：EvoDev: An Iterative Feature-Driven Framework for End-to-End Software Development with LLM-based Agents
- **arXiv ID**：[2511.02399](https://arxiv.org/abs/2511.02399)
- **发布时间**：2025年11月（预印本）
- **引用情况**：已有引用记录

---

## 2. 作者与机构：确认

- **第一作者**：Junwei Liu（刘俊伟）
- **机构**：复旦大学计算机学院，CodeWisdom 研究组
- **导师**：彭鑫（Xin Peng）、娄一翎（Yiling Lou）
- **其他作者**：Chen Xu 等
- **作者主页**：[to-d.github.io](https://to-d.github.io/)（最后更新：2024年11月2日，未提及 EvoDev）

---

## 3. 论文核心内容：与描述一致

### 3.1 FDD 灵感来源

论文明确说明灵感来自经典的 Feature-Driven Development (FDD) 方法论（参考文献：Goyal, 2007）。论文第 2.2 节详细介绍了 FDD 的五个基本活动，并论述了为什么 FDD 适合适配到多智能体开发工作流中。

### 3.2 Feature Map（特性地图）

论文引入了 Feature Map 作为核心创新，定义为：
- 一个**有向无环图（DAG）**
- 显式建模特性之间的依赖关系
- 每个节点包含三层上下文信息：
  - **业务层（Business-layer）**：功能范围描述
  - **设计层（Design-layer）**：UI组件和数据实体
  - **实现层（Implementation-layer）**：代码变更记录

### 3.3 框架三个阶段

1. **Overall Design Construction**（总体设计构建）
2. **Feature Map Generation**（特性地图生成）
3. **Iterative Features Development**（迭代特性开发）

### 3.4 实验结果

- 在 Android 开发任务上评估
- 构建了 APPDev 数据集（15个 Android 应用）
- 超越最佳基线 Claude Code **56.8%**（Function Completeness）
- 单智能体性能提升 **16.0%–76.6%**
- 耗费约 500 人时和 1,500 美元

### 3.5 对比线性 to-do 列表

论文确实将 EvoDev 的 Feature Map 方法与 Claude Code 的线性 to-do 列表策略进行了对比：
> "In contrast to the widely adopted linear planning strategies that merely produce a to-do list, our feature map not only captures the complex dependencies among requirements using a graph structure, but also encapsulates critical context at the business, design, and implementation layers."

---

## 4. ISSTA 2026 会议信息：确认

- **全称**：ACM SIGSOFT International Symposium on Software Testing and Analysis
- **届次**：第35届
- **时间**：2026年10月3-9日
- **地点**：美国加州奥克兰
- **与 SPLASH 2026 联合举办**
- **官方页面**：[conf.researchr.org](https://conf.researchr.org/track/issta-2026/issta-2026-research-papers)
- **投稿系统**：[HotCRP](https://issta2026.hotcrp.com/) — 705篇投稿，218篇被接受（约31%接受率）
- **PC Chairs**：Marcel Böhme（MPI）, Cindy Rubio-González（UC Davis）

### 重要时间线

| 日期 | 事件 |
|---|---|
| 2026-01-29 | 论文投稿截止 |
| 2026-03-24~26 | 作者回复期 |
| 2026-04-16 | 初始通知（已过） |
| 2026-05-21 | 大修提交截止 |
| 2026-06-25 | 最终通知 |
| 2026-07-23 | Camera Ready |

---

## 5. "已被 ISSTA 2026 接收"：无法独立验证

### 支持此说法的证据

- ISSTA 2026 初始通知已于 2026年4月16日发出，距今约3周，作者应已获知结果
- 论文格式采用 ACM `acmart` 文档类，符合 ISSTA 投稿要求
- 论文发表于 arXiv 的时间（2025年11月）早于 ISSTA 投稿截止（2026年1月），时间线吻合
- 搜索引擎摘要中提及作者主页有 "ISSTA 2026" 字样

### 无法确认的原因

- **ISSTA 2026 官方页面未公开已接受论文列表**（当前仍显示 Call for Papers）
- **作者个人主页**（to-d.github.io）最后更新于 2024年11月，未提及 EvoDev 或 ISSTA 2026
- **arXiv 版本的 ACM 元数据仍为占位符**：
  ```
  conference: Make sure to enter the correct conference title from your rights 
  confirmation email; June 03–05, 2018; Woodstock, NY
  ```
  说明 camera-ready 尚未完成
- 最终通知要到 **2026年6月25日** 才发出，目前论文可能处于"Accept"或"Major Revision"状态

---

## 6. "软件工程领域顶级国际会议"：基本准确

ISSTA 是 ACM SIGSOFT 下属的**软件测试与分析**领域的顶级会议。严格来说它更侧重测试与分析子领域，而非整个软件工程领域。但在学术宣传中将 ISSTA 称为"软件工程领域顶级会议"是常见做法。

---

## 7. 数据来源

| 来源 | URL |
|---|---|
| arXiv 论文 | https://arxiv.org/abs/2511.02399 |
| arXiv HTML 全文 | https://arxiv.org/html/2511.02399v2 |
| ISSTA 2026 官方 | https://conf.researchr.org/track/issta-2026/issta-2026-research-papers |
| HotCRP 提交系统 | https://issta2026.hotcrp.com/ |
| Junwei Liu 主页 | https://to-d.github.io/ |
| Semantic Scholar | https://www.semanticscholar.org/paper/EvoDev... |
| ResearchGate | https://www.researchgate.net/publication/397280717 |

---

## 总结

论文本身真实可靠，内容描述与原文高度一致。ISSTA 2026 接收的说法在时间线上合理，但截至 2026年5月11日，无法从独立的公开渠道予以确认。如果该消息来源于论文作者本人或其所在机构（如复旦大学 CodeWisdom 研究组）的官方渠道，则可信度较高。
