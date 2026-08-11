---
book: harness
title: "验证：当人不再能兜底"
description: "卷一里验证的最后一道是人。测试查行为，code review 查意图，人对项目的理解补前两者的漏。三层配合工作，人在第三层做兜底。"
order: 17
part: "卷二：规模化 Agent 开发（10→100x）"
chapter: "05"
updatedAt: 2026-07-10
sourceUrl: "https://github.com/Agents-Zone/harness-engineering-playbook/blob/46a94234f8840f148e3c0ce9465be6ad10ca6065/zh/chapters/05-verification-defense.md"
sourceRevision: "46a94234f8840f148e3c0ce9465be6ad10ca6065"
---
> 🚧 本章正在开发中。

卷一里验证的最后一道是人。测试查行为，code review 查意图，人对项目的理解补前两者的漏。三层配合工作，人在第三层做兜底。

卷二这个前提不成立。并行 Agent 的产出速度超过人的 review 速度。同时在陌生领域里人的判定率接近零。任意一个约束成立卷一模式都失效。两个都常同时出现。验证责任必须从人转移到机制。

这一章讨论的问题就在这里。机制自己怎么可信。可信度从哪里来。三层机制怎么建起来又怎么跑起来。

从诊断卷一模式为什么在多子空间下失效开始，分析漂移在哪里发生，然后引入三层机制的具体分工，最后用一个真实项目走完整个流程。

---

*Harness Engineering Playbook · [AgentsZone](https://agentszone.ai) Community*
