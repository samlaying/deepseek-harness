# Agent Note: Optional bash/pwsh description

Status: implemented

[English](2026-09-06-bash-optional-description.md) | 中文

## Problem

弱模型调用 `bash` 时经常只发 `description`（UI 标签）而省略 `command`。schema 把两个键都标成必填，于是 harness 返回 `Error: invalid arguments: missing required property "command"`。模型接着原样重试同一载荷，随后被 `repeat-tool-reminder` 拦住。`description` 从不执行任何东西，把它设为必填等于教错了优先级。

## Decision

`dsh-tool-bash` 与 `dsh-tool-pwsh` 只要求 `command`。`description` 是可选 UI 文案。省略时，presenter 用 `command` 标注该调用。空白 `description` 仍会在值校验中失败。工具描述与 `command` 参数文本写明只有 `command` 会运行。缺少 `command` 时，`finalizeContent` 在同一 schema 违规之上补上明确的重试说明，禁止只带 `description` 再试。

## Alternatives considered

**从 `description` 推断 `command`。** 否决：标签是自然语言而不是 shell 字符串，编造命令会跑错程序。

**两个键都保持必填，只改写错误。** 否决：已经省略 `description` 的模型仍会失败，schema 也会继续广告错误的必填集合。

**只改 bash。** 否决：pwsh 工具是 bash 的逐调用镜像（[pwsh 工具与执行器](../feature/2026-08-01-pwsh-tool-and-executor.zh.md)）。

## Consequences

只有 `command` 的调用会执行。只有 `description` 的调用仍会失败，但模型可见文本把 `command` 标明为被执行的字符串。省略 `description` 的已记录调用现在会呈现为以 `command` 为标签的终端卡片，而不再落到通用卡片。

## Testing

`packages/shell/tool-bash/tests/tools.spec.ts` 与 `packages/shell/tool-pwsh/tests/tools.spec.ts` 钉住仅 command 执行、缺 command 的重试文案、schema `required: ['command']`，以及 presentCall 的标注行为。
