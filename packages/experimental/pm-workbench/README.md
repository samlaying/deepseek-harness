---
description: "Shared local PM Workbench project boards: one project is one markdown canvas, for experimental product-manager sessions."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-pm-workbench

English | [中文](README.zh.md)

## Summary

`dsh-experimental-pm-workbench` binds one project to one absolute folder. Markdown cards (thought, template, doc, memory) live in `<folder>/.pm-workbench/`. The Session working directory keeps `bindings.json` so every Session that shares that cwd shares the same bound folders. The model updates the board through tools; the operator can edit the same files. It is experimental: excluded from official releases and carries no stability promise.

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

Mount this package when a Session should keep a shared project board on disk:

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-profile
```

The model then calls `pm_open_project`, `pm_list_board`, and `pm_upsert_card`. `pm_open_project` and `/pm-project` take an absolute folder from the OS directory picker, or an already-bound project id. `/pm-save` writes the same canvas files so the editor can persist operator edits and inject them for the next model step.

### When to choose it

Choose it when several Sessions in one working directory must share one board, and that board must survive reloads as ordinary markdown. Avoid it when each Session should own a private canvas, or when you need a generated Remote API instead of slash commands for the editor.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

Disk files are the shared source of truth. Each successful tool or command call also appends a whole `pm-workbench/board` snapshot so Web can project the board. A workspace file watcher republishes that snapshot when files change outside the tools. Operator saves call `agent.inject`, so the next model step sees the new markdown. The package publishes no `./invariant` companion: the board snapshot is written by one function that also writes the files, so there are not two independent observations to diverge.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Experimental packages](../README.md) — incubation status and release exclusion.
- [PM Workbench host profile](../pm-workbench-profile/README.md) — the installable host layer.
- [PM Workbench Web UI](../client-ui-pm-workbench/README.md) — conversation view and canvas.

-----

<a id="model-experience"></a>
## Model Experience

### Request context and condition

#### What the model sees

Before a project is open, the `pm-workbench:board` section is the closed-board paragraph. After a board exists, the same section lists the project id, roster, and card titles, and tells the model to use `pm_upsert_card`. Tool results repeat that listing. Operator edits arrive as injected plugin context that includes the full markdown of every card.

##### Closed board

```markdown
PM Workbench is available. Call pm_open_project with an absolute folder path (the operator binds a directory in Finder) or an already-bound project id. One bound folder is one board, shared by every Session in this working directory. Canvas files live in `<folder>/.pm-workbench/`.
```

#### Token effect

Conditional: the closed-board paragraph is fixed; an open board replaces it with the current roster and card list. Injected operator edits add the full card markdown on the next step.

#### KV Cache effect

The section is prefix-stable while the current project and card list are unchanged. Opening a project, upserting a card, or an operator save replaces the section.

## Known Limitations and Deferred Work

- **Experimental** — official releases exclude this package; the event type and tool names can change.
- **Whole-card writes** — `pm_upsert_card` sends complete markdown; character-level canvas refresh uses the live Assistant stream in the Web view, not per-token disk writes.
- **Commands, not Remote** — the canvas persists operator edits through `/pm-save` JSON rather than a generated Typert Remote.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
