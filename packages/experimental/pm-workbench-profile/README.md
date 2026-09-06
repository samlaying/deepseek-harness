---
description: "Private PM Workbench host profile layer over dsh-base, for source-checkout users who want shared project canvases."
kind: "package-bundle"
---

# @deepseek-ai/dsh-experimental-pm-workbench-profile

English | [中文](README.zh.md)

## Summary

`dsh-experimental-pm-workbench-profile` is a private profile layer that inserts [`@deepseek-ai/dsh-experimental-pm-workbench`](../pm-workbench/README.md) over `@deepseek-ai/dsh-base`. Add it explicitly to an initialized source-checkout profile; official releases exclude this package.

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

```sh
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-profile
```

The profile must already contain `@deepseek-ai/dsh-base`. Removing the package with `dsh plugin --profile web remove @deepseek-ai/dsh-experimental-pm-workbench-profile` drops the layer.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The package's runtime content is [`cordis.patch.yml`](cordis.patch.yml). It inserts the `pm-workbench` row. No runtime invariant companion is published; the package carries only a static profile patch.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [PM Workbench host](../pm-workbench/README.md) — tools, files, and projection.
- [PM Workbench Web profile](../pm-workbench-web-profile/README.md) — browser canvas.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through the inserted host plugin.

#### KV Cache effect

This bundle adds no prompt text of its own; the host plugin owns prompt, schema, and cache effects.

## Known Limitations and Deferred Work

- **Source-checkout only** — official CLI, Web, npm, and Python release payloads exclude this private package.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
