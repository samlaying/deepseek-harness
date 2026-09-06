---
description: "Web PM Workbench conversation view: a shared project canvas with live markdown preview and edit."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-client-ui-pm-workbench

English | [中文](README.zh.md)

## Summary

`dsh-experimental-client-ui-pm-workbench` registers a Conversation view tab that shows bound project folders, a live transcript of the Session, and one infinite canvas of markdown cards. **Bind folder** opens the OS directory picker (Finder on macOS). Saving a card goes through `/pm-save`. It is experimental: excluded from official releases and carries no stability promise.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Install the Web layer after the host layer:

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-web-profile
```

Switch the Session to the PM board tab. Click **Bind folder** and choose a directory in Finder. Click a listed folder to reopen that board. Streamed Assistant text appears as a live card; saved cards support markdown preview and edit.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The view reads the `pmWorkbench` projection and the Chat live partial. **Bind folder** calls `uiWorkspace.pickDirectory()`, then `/pm-project` with the absolute path as a JSON string. Reopening a listed project sends its id. Card saves call `/pm-save`. The AppFrame and Sidebar stay in place; this package only occupies `conversation.view`. The Host plugin body is empty.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [PM Workbench host](../pm-workbench/README.md) — files, tools, and projection.
- [PM Workbench Web profile](../pm-workbench-web-profile/README.md) — installable Web layer.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through the host PM Workbench tools selected alongside this view.

#### KV Cache effect

This Web plugin adds no model request content; the host tools own prompt, schema, and cache effects.

## Known Limitations and Deferred Work

- **Experimental** — official releases exclude this package.
- **Tab is global** — the view registers for every Session in a Web profile that mounts this plugin, not only a PM preset.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
