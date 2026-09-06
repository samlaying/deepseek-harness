# Agent Note: PM 工作台是共享的本地项目画布

Status: implemented

[English](2026-09-06-pm-workbench-shared-project-board.md) | 中文

## 问题

产品经理 Session 需要一块出现在对话旁边的画布：文档、思路、模板和主动记忆，随 Assistant 流式输出刷新，可按 Markdown 编辑，落在磁盘上，并且在操作者编辑后模型也能看到。替换 `AppFrame` 会把用户关进第二个应用。从 Assistant 散文里解析标记是私有协议。每个文档一块面板也不符合「**一个项目一块画板**、同一工作目录下每个 Session 共用」的产品规则。

## 决策

**磁盘就是共享画板。** 一个项目就是一个绑定文件夹。画布文件落在 `<folder>/.pm-workbench/`（`layout.json` 与 `cards/<id>.md`）。Session cwd 保存 `.pm-workbench/bindings.json`，把项目 id 映射到这些文件夹。共享工作目录的 Session 共用这些绑定。操作者通过系统目录选择器（macOS 上是访达）绑定文件夹。工具 `pm_open_project`、`pm_list_board` 和 `pm_upsert_card` 写入这些文件，并追加完整的 `pm-workbench/board` 快照供 Web 投影。`/pm-project` 与 `/pm-save` 写入同一批文件；操作者保存还会 `inject` 新的 Markdown，让下一步模型请求看到它。

**逐字刷新来自 Chat 流。** Web 视图把 `useChat` 的直播 partial 画到实时卡片上。工具仍发送完整卡片 Markdown；画布不会按 token 写文件。

**画布是一个 `conversation.view` 标签。** `@deepseek-ai/dsh-experimental-client-ui-pm-workbench` 占用该槽。AppFrame 与 Sidebar 保持挂载。变更走 `remote.commands.execute`，而不是新的 Typert Remote。

这些包装在 `packages/experimental/` 下，通过私有 profile bundle 安装，因此正式的 `dsh-web-app` 保持不变。

## 考虑过的替代方案

**选中 PM preset 时替换 AppFrame。** 否决：Sidebar 和会话切换会消失。

**从 Assistant 文本解析 `[OPEN_PANEL]`。** 否决：私有散文协议，不能作为工具结果重建。

**为画板 I/O 做一个 Typert Remote。** 延后：斜杠命令复用已有 command Remote；以后可以用生成的画板 API 替换命令而不改文件。

**按 Session 分画板。** 否决：产品规则是一个项目一块板，共享。

## 后果

打开项目或保存卡片是一次文件系统写入外加一个整值会话事件。同一工作目录下的其他 Session 能看到新快照，因为 Host 会向每个带该 `cwd` 的 agent 重发。逐字刷新只用于呈现，直到工具或 `/pm-save` 提交 Markdown。

## 测试

Host 测试覆盖文件往返、工具与命令写入、共享 cwd 投影、提示词文案，以及文件监视重发。Client 测试覆盖视图注册、命令失败折叠、预览与保存。
