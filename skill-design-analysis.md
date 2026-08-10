# Skill 设计深度分析：从 UI-UX-Pro-Max 看最佳实践

## 一、案例概览：UI-UX-Pro-Max 架构

| 层 | 内容 | 大小 | 加载时机 |
|---|---|---|---|
| SKILL.md frontmatter | 触发条件 + description | ~1KB | 每次对话匹配时 |
| SKILL.md 内联规则 | 10 大类优先级规则 + Quick Reference + Common Rules + Checklist | ~44KB | skill 触发时全量加载 |
| data/*.csv | 14 个 CSV 数据文件（styles, colors, fonts, ux-guidelines 等） | 1.4MB | 按需 BM25 检索 |
| scripts/*.py | BM25 搜索引擎 + Design System 生成器 + 持久化 | ~60KB | 用户发出搜索命令时 |

### 技术栈亮点

- **自研 BM25 搜索引擎**：纯 Python 标准库实现，零外部依赖
- **11 个搜索域**：style / color / typography / chart / ux / product / landing / google-fonts / icons / react / web
- **Design System 生成器**：聚合多域搜索结果 + reasoning 推理，输出完整设计系统
- **Master + Overrides 持久化模式**：跨 session 保持设计一致性

---

## 二、做得好的地方

### 2.1 数据与规则分离

可搜索的实体数据（颜色、字体、产品类型）放入 CSV，原则性规则内联在 SKILL.md。避免 1.4MB 数据全灌上下文。

### 2.2 BM25 检索引擎

轻量 BM25 实现，k1=1.5, b=0.75，标准参数。零依赖，`python3` 即可运行。

### 2.3 领域划分清晰

每个 domain 有独立的 `search_cols` 和 `output_cols`，做到按需检索、按需输出。domain 自动检测通过关键词匹配实现。

### 2.4 Design System 合成器

`--design-system` 不是一个简单搜索，而是聚合 5 个 domain（product + style + color + landing + typography）+ reasoning 推理规则的合成操作，输出完整的「设计系统推荐」。

### 2.5 优先级分层

CRITICAL → HIGH → MEDIUM → LOW，让 AI 清楚哪些规则是红线。

### 2.6 有状态持久化

`--persist` 创建 Master + page overrides 的层级结构，后续 session 可复用设计决策。

---

## 三、核心问题

### 3.1 SKILL.md 内联内容过重（44KB）

SKILL.md 一旦触发，44KB 全量灌入上下文。§1-§10 的 Quick Reference 每个分类 10-30 条规则，300+ 行。**但大多数场景只用其中 2-3 个分类**。

### 3.2 内联规则与 CSV 数据大量重复

Accessibility 的 `color-contrast: 4.5:1` 既在 SKILL.md §1 写了一遍，又在 CSV 有详细条目。两份维护，内联版本不会被搜索更新。

### 3.3 触发范围过宽

frontmatter description 包含了几乎所有 UI 动词和元素，几乎任何前端请求都会触发，即使只是修一个 CSS typo。

---

## 四、好的 Skill 应该怎么设计

### 4.1 内联策略：三层金字塔

```
┌──────────────────────────────┐
│  Layer 0: Frontmatter         │  ~200 tokens — 触发判断
├──────────────────────────────┤
│  Layer 1: 决策框架            │  ~500 tokens — 什么时候用、流程骨架
├──────────────────────────────┤
│  Layer 2: 关键约束            │  ~1K tokens  — 不能违反的硬规则
├──────────────────────────────┤
│  Layer 3: 按需检索            │  通过脚本按需加载
└──────────────────────────────┘
```

**Layer 0**：精确触发，不贪大求全
**Layer 1**：告诉 AI "先做什么、再做什么"，而不是列出所有规则
**Layer 2**：只有真正 CRITICAL 的规则才内联
**Layer 3**：通过脚本/命令按需检索

**目标**：SKILL.md 从 44KB 瘦身到 5-8KB。

### 4.2 渐进式加载：按场景逐步展开

当前是 all-or-nothing：要么 0，要么 44KB。

更好的方式：

```
用户说 "做一个 landing page"
  → SKILL.md 加载 Layer 1+2（~2KB）
  → AI 执行 Step 2: python3 search.py "landing" --design-system
  → 脚本返回 Pattern + Style + Color + Typography
  → AI 执行 Step 3: python3 search.py "animation" --domain ux（补充细节）
```

**核心原则：SKILL.md 不应该包含所有答案，而是告诉 AI 去哪里找答案。**

### 4.3 索引方案评估

| 方面 | 现状 | 建议 |
|------|------|------|
| 搜索算法 | BM25 纯文本匹配 | 够用，skill 场景不需要向量搜索 |
| 域划分 | 11 domain 硬编码 | 合理，但缺少跨域关联索引 |
| 自动检测 | 关键词匹配 | 先检测 domain 再搜索，减少无效检索 |
| 结果截断 | max_results=3 硬编码 | 按 query 复杂度动态调整 |

**缺失能力：跨域关联**。用户说"做 SaaS 定价页"，当前分别搜 product / style / color / landing，但它们之间没有关联。`ui-reasoning.csv` 尝试做了推理规则，但只有 162 行，覆盖有限。

建议在 CSV 中加入 `related_domains` 字段，或在 reasoning 层做轻量规则引擎。

### 4.4 触发精度

当前 frontmatter description 是一个超长字符串，包含几乎所有 UI 词汇。

**原则：description 是给触发系统用的，不是给 AI 学习用的。**

```yaml
# 差：触发过宽
description: "UI/UX design for web and mobile. Includes 50+ styles, 
161 color palettes... Actions: plan, build, create, design, implement, 
review, fix, improve, optimize, enhance, refactor, check..."

# 好：精确有边界
description: "UI/UX design system generator. Use when creating new 
pages/components, choosing styles/colors/typography, or reviewing UI 
quality. Skip for backend or minor CSS fixes."
```

### 4.5 有状态设计模式

`--persist` 的 Master + Overrides 模式在 skill 设计中比较少见，但对需要跨 session 一致性的场景非常有价值。

```
design-system/
├── MASTER.md          ← 全局 Source of Truth
└── pages/
    ├── dashboard.md   ← 页面级 override
    └── checkout.md    ← 页面级 override
```

这个模式值得更多 skill 借鉴。

---

## 五、评估总表

| 原则 | 说明 | 评分 |
|------|------|------|
| **内联最小化** | SKILL.md 只放触发 + 框架 + CRITICAL 规则 | ⭐⭐⭐ (3/10) |
| **渐进式加载** | 先决策框架，再按需检索细节 | ⭐⭐⭐⭐⭐⭐ (6/10) |
| **索引方案** | BM25 + Domain 划分 + Reasoning | ⭐⭐⭐⭐⭐⭐⭐⭐ (8/10) |
| **触发精度** | 短而精确的 description + Skip 条件 | ⭐⭐⭐⭐ (4/10) |
| **有状态能力** | persist + Master/Overrides | ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9/10) |
| **零依赖** | 纯 Python 标准库 | ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (10/10) |
| **可维护性** | CSV 可独立更新 | ⭐⭐⭐⭐⭐⭐⭐ (7/10) |

---

## 六、一句话结论

> 数据层和脚本层的设计是第一梯队的，但 SKILL.md 的内联策略需要大幅瘦身——把 44KB 压到 5-8KB，把详细规则全部移入可检索的数据层。**好的 skill 不是百科全书，而是一个高效的索引器和决策路由。**
