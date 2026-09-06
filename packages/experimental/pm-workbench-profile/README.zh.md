---
description: "私有 PM 工作台 Host profile 层，叠在 dsh-base 上，供源码 checkout 用户使用共享项目画布。"
kind: "package-bundle"
---

# @deepseek-ai/dsh-experimental-pm-workbench-profile

[English](README.md) | 中文

## 概述

`dsh-experimental-pm-workbench-profile` 是一层私有 profile，在 `@deepseek-ai/dsh-base` 上插入 [`@deepseek-ai/dsh-experimental-pm-workbench`](../pm-workbench/README.zh.md)。需要显式加到已初始化的源码 checkout profile；正式发布排除本包。

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

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-profile
```

profile 必须已经包含 `@deepseek-ai/dsh-base`。用 `dsh plugin --profile web remove @deepseek-ai/dsh-experimental-pm-workbench-profile` 移除本包会去掉这一层。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

本包的运行时内容是 [`cordis.patch.yml`](cordis.patch.yml)。它插入 `pm-workbench` 行。不发布运行时 invariant 伴生包；本包只携带静态 profile patch。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [PM 工作台 Host](../pm-workbench/README.zh.md) — 工具、文件与投影。
- [PM 工作台 Web profile](../pm-workbench-web-profile/README.zh.md) — 浏览器画布。

-----

<a id="model-experience"></a>
## 模型体验

间接通过插入的 Host 插件。

#### KV Cache 影响

本 bundle 不添加自己的提示词文本；Host 插件拥有提示词、schema 与缓存影响。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **仅源码 checkout** — 正式 CLI、Web、npm 与 Python 发布载荷排除本私有包。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>
