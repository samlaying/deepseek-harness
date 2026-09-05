/**
 * Side analysis panel plugin client entry point.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { SideAnalysisPanel } from './components/SideAnalysisPanel.tsx'

export type { AnalysisRecord, PreferenceSnapshot, SatisfactionSignal } from './types.ts'
export { SideAnalysisPanel } from './components/SideAnalysisPanel.tsx'

/** Services required by the side analysis panel plugin. */
export const inject = ['slots', 'sessions']

/**
 * Register the side analysis panel into the shell overlay.
 * @param ctx - Client context
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'side-analysis',
    inject: () => ({
      getSessionSnapshot: (sessionId: string) => ctx.sessions.binding(sessionId as import('@deepseek-ai/dsh-api-remotes/client').SessionId)?.session.getSnapshot(),
    }),
  }, SideAnalysisPanel))
}
