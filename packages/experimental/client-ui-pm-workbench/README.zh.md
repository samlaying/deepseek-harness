---
description: "Web PM 工作台会话视图：共享项目画布，支持 Markdown 直播预览与编辑。"
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-client-ui-pm-workbench

[English](README.md) | 中文

## 概述

`dsh-experimental-client-ui-pm-workbench` 注册一个 Conversation 视图标签：展示已绑定的项目文件夹、Session 的直播对话流，以及一块 Markdown 卡片无限画布。**绑定文件夹**会打开系统目录选择器（macOS 上是访达）。保存卡片走 `/pm-save`。本包是实验性的：不进入正式发布，也不提供稳定性承诺。

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

在 Host 层之后安装 Web 层：

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-web-profile
```

把 Session 切到 PM 画板标签。点 **绑定文件夹**，在访达里选一个目录。点列表里的文件夹可重新打开该画板。流式 Assistant 文本会出现在实时卡片上；已保存的卡片支持 Markdown 预览与编辑。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

视图读取 `pmWorkbench` 投影和 Chat 直播 partial。**绑定文件夹**调用 `uiWorkspace.pickDirectory()`，再用 JSON 字符串绝对路径走 `/pm-project`。重新打开列表中的项目则发送其 id。卡片保存走 `/pm-save`。AppFrame 与 Sidebar 保持就位；本包只占用 `conversation.view`。Host 插件体为空。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [PM 工作台 Host](../pm-workbench/README.zh.md) — 文件、工具与投影。
- [PM 工作台 Web profile](../pm-workbench-web-profile/README.zh.md) — 可安装的 Web 层。

-----

<a id="model-experience"></a>
## 模型体验

间接通过与本视图一同选择的 Host PM 工作台工具。

#### KV Cache 影响

本 Web 插件不添加模型请求内容；Host 工具拥有提示词、schema 与缓存影响。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **实验性** — 正式发布排除本包。
- **标签全局** — 只要 Web profile 挂载本插件，视图会注册到每个 Session，而不仅是 PM preset。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>
