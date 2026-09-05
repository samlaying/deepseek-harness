# @deepseek-ai/dsh-client-ui-side-analysis

English | [中文](README.zh.md)

Conversation side analysis panel plugin: observes ongoing conversations passively, automatically infers intent, satisfaction score, and user preference profiles, and displays a collapsible analysis panel docked on the right side of the viewport.

## Features

- **Silent Observation**: Monitors conversation turns without mutating the main chat DOM or modifying messages.
- **Automated Turn Analysis**: Produces structured `AnalysisRecord` entries per Q&A turn with inferred intent, latency, token count, satisfaction score, and behavioral signals.
- **Preference Profiling**: Incrementally extracts user preferences across response length, technical depth, language, code style, communication tone, and recurring topics.
- **Right-Docked UI**: Renders in `shell.overlay` with a 48px collapsed rail showing average satisfaction and warning dots, expanding into a 360px rich analytics panel.
- **User Verification**: Supports 1-5 star user ratings, accuracy toggle ("准"/"不准"), and expandable note input with dual-write persistence (`localStorage` + `IndexedDB`).
- **HMR Compatibility**: Adheres to DSH HMR styling rules (`data-plugin="side-analysis-panel"`).

## Model Experience

This plugin is purely client-side presentation and passive observation; it does not introduce new tools or mutate model-visible prompt context.

#### KV Cache effect

No cache invalidation.

## Known Limitations and Deferred Work

- **In-memory fallback**: Operates with synchronous in-memory fallbacks when local storage or IndexedDB is restricted.
