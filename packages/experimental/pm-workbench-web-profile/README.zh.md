---
description: "在 Host 画板层之后，把实验性 PM 工作台画布加到源码 checkout 的 Web profile。"
kind: "package-bundle"
---

# @deepseek-ai/dsh-experimental-pm-workbench-web-profile

[English](README.md) | 中文

## 概述

`dsh-experimental-pm-workbench-web-profile` 是 [PM 工作台](../pm-workbench/README.zh.md) 的私有 Web 层。在 `@deepseek-ai/dsh-web-app` 与 [`@deepseek-ai/dsh-experimental-pm-workbench-profile`](../pm-workbench-profile/README.zh.md) 之后加入，即可在浏览器中显示项目画布。正式发布排除本包。

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
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-web-profile
```

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

本包的运行时内容是 [`cordis.patch.yml`](cordis.patch.yml)。它插入 `ui-pm-workbench`。不发布运行时 invariant 伴生包。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [PM 工作台浏览器 UI](../client-ui-pm-workbench/README.zh.md) — 画布行为。
- [Web bundle](../../bundle/web-app/README.zh.md) — 本 patch 扩展的稳定浏览器层。

-----

<a id="model-experience"></a>
## 模型体验

间接通过与本 Web 层一同选择的 Host 侧 PM 工作台 profile。

#### KV Cache 影响

本 Web bundle 不添加模型请求内容；Host 侧工具拥有提示词、schema 与缓存影响。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **有序组合** — `dsh-base`、`dsh-web-app`、`dsh-experimental-pm-workbench-profile` 与本包必须保持该顺序。
- **仅源码 checkout** — 正式 CLI、Web、npm 与 Python 发布载荷排除本私有包。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>
