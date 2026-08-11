---
book: harness
title: "让流程匹配 Agent 速度"
description: "Code review、部署流水线、测试流程、发布审批，这些流程在人类开发速度下是质量保障机制。Agent 的产出速度把它们变成了吞吐瓶颈。但不能因为它们变慢了就一刀切地去掉，每个流程当初存在都有其质量理由。"
order: 27
part: "卷三：治理百倍速的组织"
chapter: "06C"
updatedAt: 2026-07-10
sourceUrl: "https://github.com/Agents-Zone/harness-engineering-playbook/blob/46a94234f8840f148e3c0ce9465be6ad10ca6065/zh/chapters/06c-process-speed.md"
sourceRevision: "46a94234f8840f148e3c0ce9465be6ad10ca6065"
---
> 🚧 本节正在开发中。

Code review、部署流水线、测试流程、发布审批，这些流程在人类开发速度下是质量保障机制。Agent 的产出速度把它们变成了吞吐瓶颈。但不能因为它们变慢了就一刀切地去掉，每个流程当初存在都有其质量理由。

正确的做法是逐个分析：哪些流程可以通过自动化加速（比如用 lint 和类型检查替代部分人工 review），哪些流程的触发频率需要调整（比如从定时部署改为基于事件的持续部署），哪些流程的设计前提已经不成立需要彻底重新设计（比如当 Agent 产出的 PR 粒度和人写的完全不同时，review 的单位和标准都需要重新定义）。目标不是让所有流程都变快，而是让质量保障的成本和 Agent 的产出速度匹配。

---

*Harness Engineering Playbook · [AgentsZone](https://agentszone.ai) Community*
