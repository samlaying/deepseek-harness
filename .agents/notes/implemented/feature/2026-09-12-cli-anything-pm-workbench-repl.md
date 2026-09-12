# Agent Note: CLI-Anything Compliant Interactive PM Workbench REPL

Status: implemented

## Problem

The PM Workbench Multi-Agent Swarm (Clarify, RedTeam, Benchmark, Memory) was previously accessible primarily through the Web GUI. Headless or terminal-centric workflows lacked an interactive command-line interface that allowed product managers to submit requirements, view multi-agent parallel derivation, make real-time decisions on contentious trade-offs, and automatically synchronize decisions to persistent storage.

## Decision

We implement a dedicated dual-mode CLI for the PM Workbench adhering to the CLI-Anything architecture standard:

1. **Dual-Mode Dispatch (`cli.ts`)**:
   - **Interactive REPL Mode**: Invoked by default when run with no arguments (`pnpm run pm` or `dsh-pm`). Displays branded ANSI borders, dynamic status badges, and interactive question prompts.
   - **Headless / One-Shot Mode**: Subcommands (`intake`, `memory`, `clarify`, `redteam`, `benchmark`) with optional `--json` output allow headless script consumption and automated CI integration.

2. **Interactive Loop & Human-in-the-Loop (`interactive-loop.ts`)**:
   - Concurrently executes Clarify, RedTeam, and Benchmark analysis agents.
   - Interactively halts when RedTeam uncovers trade-offs, prompting the PM for explicit decisions (e.g. prompt friction vs cost visibility, overdraft handling).
   - Once resolved, automatically invokes `pm_memory_agent` to atomically commit decisions and actions to `data/pm-memory/` (`人员记忆.md`, `关键决策.md`, `项目上下文.md`).

3. **Zero-Dependency ANSI Skin (`repl-skin.ts`)**:
   - Provides standardized framed banners, status badges, progress dividers, and colored prompt markers without external npm dependencies.

## Consequences

- Product managers can operate the entire PM memory and multi-agent workflow directly from terminal REPL sessions or headless scripts.
- Human-in-the-loop decision checkpoints prevent unintended automatic commitments while keeping persistence guaranteed through `pm_memory_agent`.
