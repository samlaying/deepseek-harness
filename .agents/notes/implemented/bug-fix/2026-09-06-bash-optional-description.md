# Agent Note: Optional bash/pwsh description

Status: implemented

English | [中文](2026-09-06-bash-optional-description.zh.md)

## Problem

Weak models calling `bash` often send only `description` (a UI label) and omit `command`. The schema required both keys, so the harness returned `Error: invalid arguments: missing required property "command"`. The model then retried the identical payload, which `repeat-tool-reminder` then blocked. `description` never executed anything, so requiring it taught the wrong priority.

## Decision

`dsh-tool-bash` and `dsh-tool-pwsh` require only `command`. `description` is optional UI copy. When it is omitted, presenters label the call with `command`. A blank `description` still fails value validation. The tool description and the `command` parameter text state that only `command` runs. When `command` is missing, `finalizeContent` replaces the schema error with the same violation plus an explicit retry instruction that forbids a description-only retry.

## Alternatives considered

**Infer `command` from `description`.** Rejected: the label is natural language, not a shell string, and inventing a command would run the wrong program.

**Keep both keys required and only rewrite the error.** Rejected: models that already omit `description` would still fail, and the schema would keep advertising the wrong required set.

**Change only bash.** Rejected: the pwsh tool is a call-for-call mirror of bash ([pwsh tool and executor](../feature/2026-08-01-pwsh-tool-and-executor.md)).

## Consequences

A call with only `command` executes. A call with only `description` still fails, but the model-visible text names `command` as the executed string. Logged calls that omitted `description` now present as a terminal card labeled with `command` instead of falling back to the generic card.

## Testing

`packages/shell/tool-bash/tests/tools.spec.ts` and `packages/shell/tool-pwsh/tests/tools.spec.ts` pin command-only execution, the missing-command retry text, schema `required: ['command']`, and presentCall labeling.
