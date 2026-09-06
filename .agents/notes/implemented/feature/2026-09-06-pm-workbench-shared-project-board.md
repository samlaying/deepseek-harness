# Agent Note: PM Workbench is a shared local project canvas

Status: implemented

English | [中文](2026-09-06-pm-workbench-shared-project-board.zh.md)

## Problem

A product-manager Session needs a canvas that appears beside the conversation: documents, thoughts, templates, and proactive memory, refreshed as the Assistant streams, editable as markdown, persisted on disk, and visible to the model after an operator edit. Replacing `AppFrame` trapped the user in a second application. Parsing markers out of Assistant prose was a private protocol. One document per panel also failed the product rule that **one project is one board**, shared by every Session in that working directory.

## Decision

**Disk is the shared board.** One project is one bound folder. Canvas files live in `<folder>/.pm-workbench/` (`layout.json` and `cards/<id>.md`). The Session cwd keeps `.pm-workbench/bindings.json` mapping project ids to those folders. Sessions that share a working directory share those bindings. The operator binds a folder through the OS directory picker (Finder on macOS). Tools `pm_open_project`, `pm_list_board`, and `pm_upsert_card` write those files and append a whole `pm-workbench/board` snapshot so Web can project the canvas. `/pm-project` and `/pm-save` write the same files; an operator save also `inject`s the new markdown so the next model step sees it.

**Live characters come from the Chat stream.** The Web view reads `useChat` live partials onto a live card. Tools still send complete card markdown; the canvas does not write one file per token.

**The canvas is a `conversation.view` tab.** `@deepseek-ai/dsh-experimental-client-ui-pm-workbench` occupies that slot. AppFrame and Sidebar stay mounted. Mutations travel through `remote.commands.execute`, not a new Typert Remote.

The packages live under `packages/experimental/` and install through private profile bundles so official `dsh-web-app` stays unchanged.

## Alternatives considered

**Replace AppFrame when a PM preset is selected.** Rejected: Sidebar and session switching disappeared.

**Parse `[OPEN_PANEL]` from Assistant text.** Rejected: a private prose protocol, not reconstructable as tool results.

**One Typert Remote for board I/O.** Deferred: slash commands reuse the existing command Remote; a generated board API can replace them later without changing the files.

**Per-Session boards.** Rejected: the product rule is one project, one board, shared.

## Consequences

Opening a project or saving a card is a filesystem write plus a whole-value session event. Other Sessions in the same working directory see the new snapshot because the host republishes it to every agent with that `cwd`. Character-level refresh is presentation-only until a tool or `/pm-save` commits markdown.

## Testing

Host tests cover file round-trips, tool and command writes, shared-cwd projection, prompt copy, and a file-watch republish. Client tests cover view registration, command failure folding, preview, and save.
