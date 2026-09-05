# Agent Note: project decision context through native Codex hooks

Status: implemented

English | [中文](2026-08-14-project-decision-codex-hook.zh.md)

## Problem

The project had the decision-context workflow from InterCraft as a reference, but no project-local Codex hook configuration to inject recent decisions and archive completed turns.

## Decision

`.codex/hooks.json` registers synchronous `SessionStart`, `UserPromptSubmit`, and `Stop` commands. `.codex/decision-hook.py` emits Codex JSON context for the first two events and archives the latest transcript turn to `docs/decisions.md` on `Stop`. It uses the event payload's `cwd`, keeps state under `.codex/`, and treats failures as non-blocking.

The implementation deliberately does not auto-commit the decision log: Codex has no portable `SessionEnd` hook in this configuration, and committing from `Stop` would turn a context hook into an implicit repository mutation.

## Alternatives considered

**Referencing InterCraft's script by absolute path.** Rejected because the hook would only work on one machine and would not travel with this repository.

**Using the harness's `dsh-hooks-codex` plugin.** Rejected for this project-level configuration because that plugin runs hooks inside a harness composition; the requested workflow is a native Codex hook for Codex CLI sessions.

## Consequences

The first prompt can receive recent decision context, and a stopping turn can be archived without depending on a second runtime. The decision log and hook state are created lazily. Stop-time transcript availability remains dependent on Codex's payload and transcript flush timing.
