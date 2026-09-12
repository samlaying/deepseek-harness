# PM Workbench CLI — CLI-Anything SOP 规范指南

## 1. 概述与设计哲学

`dsh-pm` 是基于 **CLI-Anything** 架构理念为 DeepSeek Harness PM 记忆与决策工作台构建的互动式命令行客户端。

### 核心定位
- **双模态运行 (Dual-Mode)**:
  - **默认交互式 REPL**: 具备精美 ANSI 终端皮肤 (`ReplSkin`)、动态进度指示、多轮对话与决策打断机制。
  - **无头/自动化单命令**: 支持一键子命令输出结构化数据 (`--json`)，供 CI/CD 或上层编排 Agent 直接消费。
- **多 Agent 并发与人类介入 (Human-in-the-Loop)**:
  - 并行派发 Clarify、RedTeam、Benchmark 3 大专职 Subagent。
  - 遇到边界死角与关键业务权衡时，主动打断并向 PM 呈现结构化选项进行决策拍板。
- **唯一真理源持久化 (SSOT Sync)**:
  - 经由 PM 拍板确认后，由 `pm_memory_agent` 负责最终收敛并将决策原子写入 `data/pm-memory/` 核心记忆库。

---

## 2. 命令行使用规范

### 启动命令

```bash
# 进入交互式 REPL 模式
pnpm run pm
# 或通过全局 bin (npm link / dsh-pm)
dsh-pm
```

### 单命令模式 (One-shot)

```bash
# 需求澄清与多 Agent 自动化推导
pnpm run pm intake "用户需要算力消费明细与每条消息实际消耗Badge"

# 输出纯 JSON 结果 (适合脚本与 Agent 自动化调用)
pnpm run pm intake "需求文本" --json

# 查看并检索项目记忆状态
pnpm run pm memory

# 单独调用特定 Agent
pnpm run pm clarify "需求文本"
pnpm run pm redteam "方案文本"
pnpm run pm benchmark "需求文本" --target WorkBuddy
```

---

## 3. REPL 交互指令

在 REPL 会话中，支持以下内部命令：

| 命令 | 描述 |
|------|------|
| `:help` / `?` | 显示帮助菜单与所有支持的交互式指令 |
| `:memory` / `:m` | 查看当前已加载的 PM 记忆核心状态 (人员/决策/项目上下文) |
| `:clear` | 清理当前终端屏幕 |
| `:quit` / `:exit` | 退出 PM 工作台 CLI |
| 直接输入文本 | 触发「多 Agent 并行质询 → PM 交互决策 → 记忆库同步」流水线 |

---

## 4. 架构分层

```
packages/experimental/pm-memory/
├── src/
│   ├── cli.ts               # CLI 主入口与参数解析 (双模态调度)
│   ├── interactive-loop.ts   # 交互式 REPL 循环与决策打断逻辑
│   ├── repl-skin.ts         # 统一 ANSI 终端渲染皮肤与进度展示
│   ├── pm-memory-service.ts # PM 记忆与多 Agent 核心服务层
│   └── index.ts             # 模块导出统一门面
└── CLI_ANYTHING_PM.md       # 本规范文档
```

---

## 5. 记忆同步保证

所有推导与交互拍板结论均由 `pm_memory_agent` 自动持久化至以下三份单一真理源文件：
1. `data/pm-memory/人员记忆.md`: 记录 Stakeholder 诉求、跟进动作与承诺。
2. `data/pm-memory/关键决策.md`: 记录经过 PM 拍板的不可逆决策日志。
3. `data/pm-memory/项目上下文.md`: 记录完整的产品机制规范与边界推导。
