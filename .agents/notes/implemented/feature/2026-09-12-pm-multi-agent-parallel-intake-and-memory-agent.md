# Agent Note: PM Multi-Agent Parallel Intake and Dedicated Memory Agent

Status: implemented

## Problem

A single PM agent attempting to sequentially analyze raw requirements, debate edge cases, benchmark competitors, and manually record consensus suffers from context fatigue, uncritical confirmation bias, and missed memory updates. Furthermore, without a dedicated memory maintenance agent, stakeholder commitments and architectural decisions fail to synchronize into the persistent Single Source of Truth (SSOT).

## Decision

We introduce a 4-subagent plus 1-orchestrator architecture for DeepSeek Harness PM Workbench:

1. **`pm_clarify_agent`**: Breaks down vague input into explicit data contracts, UI scenarios, and Today Top 3 Next Actions.
2. **`pm_redteam_agent`**: Challenges necessity, cuts feature bloat, uncovers boundary deadlocks (SSE connection drops, overdrafts), and defines worst-case user fallback tables.
3. **`pm_benchmark_agent`**: Researches WorkBuddy parity, defining lightweight message-level actual cost badges and heavy-task pre-execution estimate ranges.
4. **`pm_memory_agent`**: A dedicated agent whose exclusive duty is synchronizing consensus, stakeholder assignments, and decisions into persistent files (`人员记忆.md`, `关键决策.md`, `项目上下文.md`).
5. **`pm_parallel_intake`**: A parallel orchestrator that concurrently dispatches the 3 analysis subagents via `Promise.allSettled`, then automatically pipes results to `pm_memory_agent` to update persistent memory.

The Web GUI `PmWorkbenchView` surfaces this Multi-Agent Swarm with real-time status indicators.

## Consequences

- Multi-agent parallel execution ensures independent perspectives without mutual bias.
- The dedicated memory agent guarantees that people memory and project decisions are never forgotten across sessions.
- Full compatibility with the Cordis runtime and client bundle purity requirements.
