# Agent Note: 通过原生 Codex 钩子注入项目决策上下文

Status: implemented

English | 中文

## 问题

项目有一套来自 InterCraft 的决策上下文机制作为参考，但没有项目级 Codex 钩子配置来注入最近决策并归档已完成的回合。

## 决策

`.codex/hooks.json` 注册同步的 `SessionStart`、`UserPromptSubmit` 和 `Stop` 命令。`.codex/decision-hook.py` 为前两个事件输出 Codex JSON 上下文，并在 `Stop` 时将最近一轮 transcript 归档到 `docs/decisions.md`。它使用事件 payload 中的 `cwd`，将状态保存在 `.codex/` 下，并保证异常不会阻塞宿主。

本实现不会自动提交决策日志：当前配置没有可移植的 `SessionEnd` 钩子；在 `Stop` 中提交会让上下文钩子隐式修改仓库。

## 替代方案

**通过绝对路径引用 InterCraft 脚本。** 放弃，因为钩子只能在一台机器上工作，无法随仓库迁移。

**使用 harness 的 `dsh-hooks-codex` 插件。** 放弃，因为该插件需要在 harness composition 中运行；本需求是为 Codex CLI 会话提供项目级原生钩子。

## 后果

首个提示词可以收到最近决策上下文，停止时也可以在不依赖第二个运行时的情况下归档决策。决策日志和钩子状态按需创建。停止时能否读取完整 transcript 仍取决于 Codex 的 payload 以及 transcript 刷新时机。
