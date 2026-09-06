---
description: "Add the experimental PM Workbench canvas to a source-checkout Web profile after the Host board layer."
kind: "package-bundle"
---

# @deepseek-ai/dsh-experimental-pm-workbench-web-profile

English | [中文](README.zh.md)

## Summary

`dsh-experimental-pm-workbench-web-profile` is the private Web layer for [PM Workbench](../pm-workbench/README.md). Add it after `@deepseek-ai/dsh-web-app` and [`@deepseek-ai/dsh-experimental-pm-workbench-profile`](../pm-workbench-profile/README.md) to show the project canvas in the browser. Official releases exclude this package.

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
pnpm dsh plugin --profile web add ./packages/experimental/pm-workbench-web-profile
```

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The package's runtime content is [`cordis.patch.yml`](cordis.patch.yml). It inserts `ui-pm-workbench`. No runtime invariant companion is published.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [PM Workbench browser UI](../client-ui-pm-workbench/README.md) — canvas behavior.
- [Web bundle](../../bundle/web-app/README.md) — the stable browser layer this patch extends.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through the Host-side PM Workbench profile selected alongside this Web layer.

#### KV Cache effect

This Web bundle adds no model request content; the Host-side tools own prompt, schema, and cache effects.

## Known Limitations and Deferred Work

- **Ordered composition** — `dsh-base`, `dsh-web-app`, `dsh-experimental-pm-workbench-profile`, and this package must remain in that order.
- **Source-checkout only** — official CLI, Web, npm, and Python release payloads exclude this private package.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
