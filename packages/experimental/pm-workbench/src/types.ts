/**
 * Disk-backed PM Workbench board: one project is one infinite canvas of
 * markdown cards. Session events carry the latest whole snapshot so Web can
 * project it; the files remain the shared source of truth across sessions.
 *
 * @module @deepseek-ai/dsh-experimental-pm-workbench/types
 */

/** Card kinds that occupy one project canvas. */
export const PM_CARD_KINDS = ['thought', 'template', 'doc', 'memory'] as const

/** One card kind on the project canvas. */
export type PmCardKind = (typeof PM_CARD_KINDS)[number]

/** One markdown card pinned on a project board. */
export interface PmCard {
  readonly id: string
  readonly kind: PmCardKind
  readonly title: string
  readonly markdown: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** Whole board for one project, plus the workspace project roster. */
export interface PmBoardSnapshot {
  readonly projectId: string
  /** Absolute folder bound to the current project. */
  readonly folder: string
  /** Bound project id to absolute folder. */
  folders: Record<string, string>
  projects: string[]
  cards: PmCard[]
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /**
     * Whole project-board snapshot. Latest write wins on replay. Log-only UI
     * state; never derived history. Disk files remain the shared source.
     */
    'pm-workbench/board': PmBoardSnapshot
  }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    pmWorkbench: PmBoardSnapshot | null
  }
  interface SessionProjectionMap {
    /**
     * Latest `pm-workbench/board` snapshot for this Session, or `null` before
     * the first open. Whole-value rule: every event replaces the board.
     */
    pmWorkbench: PmBoardSnapshot | null
  }
}
