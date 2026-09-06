---
description: "共享的本地 PM 工作台项目画板：一个项目一块 Markdown 画布，供实验性产品经理会话使用。"
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-pm-workbench

[English](README.md) | 中文

## 概述

`dsh-experimental-pm-workbench` 把一个项目绑定到一个绝对路径文件夹。思路、模板、文档、记忆四类 Markdown 卡片落在 `<folder>/.pm-workbench/`。Session 工作目录保存 `bindings.json`，因此同一 cwd 下的每个 Session 共用同一批绑定。模型用工具更新画板，操作者可以编辑同一批文件。本包是实验性的：不进入正式发布，也不提供稳定性承诺。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

当一个 Session 需要把共享项目画板存在磁盘上时挂载本包：

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-profile
```

模型随后调用 `pm_open_project`、`pm_list_board` 和 `pm_upsert_card`。`pm_open_project` 与 `/pm-project` 接受系统目录选择器给出的绝对路径，或已经绑定的项目 id。`/pm-save` 写入同一批画布文件，所以编辑器可以持久化操作者的修改，并注入给下一步模型请求。

### 何时选择它

当同一工作目录里的多个 Session 必须共用一块板、且这块板要以普通 Markdown 在重载后仍在时选择它。每个 Session 需要私有画布，或编辑器必须走生成的 Remote API 而不是斜杠命令时，不要用它。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

磁盘文件是共享真源。每次成功的工具或命令调用还会追加完整的 `pm-workbench/board` 快照，供 Web 投影。工作区文件监视器在工具之外改文件时会重发该快照。操作者保存会调用 `agent.inject`，所以下一步模型请求能看到新的 Markdown。本包不发布 `./invariant` 伴生包：画板快照由同时写文件的同一个函数写出，没有两份可分叉的独立观察。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [实验组](../README.zh.md) — 孵化状态与发布排除。
- [PM 工作台 Host profile](../pm-workbench-profile/README.zh.md) — 可安装的 Host 层。
- [PM 工作台 Web UI](../client-ui-pm-workbench/README.zh.md) — 会话视图与画布。

-----

<a id="model-experience"></a>
## 模型体验

### 请求上下文与条件

#### 模型看到什么

尚未打开项目时，`pm-workbench:board` 段落为关闭画板段落。画板存在后，同一段落列出项目 id、项目名册和卡片标题，并要求模型使用 `pm_upsert_card`。工具结果重复该列表。操作者编辑作为注入的插件上下文到达，其中包含每张卡片的完整 Markdown。

##### Closed board

```markdown
PM Workbench is available. Call pm_open_project with an absolute folder path (the operator binds a directory in Finder) or an already-bound project id. One bound folder is one board, shared by every Session in this working directory. Canvas files live in `<folder>/.pm-workbench/`.
```

#### Token 影响

有条件：未打开时段落固定；打开后被当前名册和卡片列表替换。操作者保存会在下一步加入完整卡片 Markdown。

#### KV Cache 影响

当前项目和卡片列表不变时该段落前缀稳定。打开项目、写入卡片或操作者保存会替换该段落。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **实验性** — 正式发布排除本包；事件类型与工具名可能变更。
- **整卡写入** — `pm_upsert_card` 发送完整 Markdown；逐字画布刷新来自 Web 视图里的直播 Assistant 流，而不是按 token 写盘。
- **命令而非 Remote** — 画布通过 `/pm-save` JSON 持久化操作者编辑，而不是生成的 Typert Remote。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>
