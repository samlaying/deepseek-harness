/**
 * Browser PM Workbench: one conversation.view tab over the shared project board.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-experimental-pm-workbench/client'
import { PmWorkbenchView, type PmWorkbenchInjected } from './PmWorkbenchView.tsx'
import { en, NS, zh, type PmWorkbenchKey } from './locales.ts'

export type { PmWorkbenchInjected, PmWorkbenchViewProps } from './PmWorkbenchView.tsx'
export type { PmWorkbenchKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** PM Workbench conversation view copy. */
    'pm-workbench': PmWorkbenchKey
  }
}

/** Required browser services for the view tab, commands Remote, and copy. */
export const inject = ['slots', 'remote', 'remote.commands', 'locale', 'uiWorkspace']

/**
 * Register the PM Workbench conversation view.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'client-ui-pm-workbench: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'pm-workbench',
    order: 5,
    locale: NS,
    label: () => t('view.label'),
    inject: (sessionId: SessionId): PmWorkbenchInjected => ({
      pickFolder: () => ctx.uiWorkspace.pickDirectory(),
      openProject: async (target) => {
        const result = await ctx.remote.commands.execute(sessionId, `/pm-project ${JSON.stringify(target)}`, [])
        if (!result.ok) return `${result.error.message} (${result.error.code})`
        if (result.value === undefined) return 'unknown command: /pm-project'
        if (result.value.result.kind === 'error') return result.value.result.text ?? 'command failed'
        return null
      },
      saveCard: async (card) => {
        const result = await ctx.remote.commands.execute(sessionId, `/pm-save ${JSON.stringify(card)}`, [])
        if (!result.ok) return `${result.error.message} (${result.error.code})`
        if (result.value === undefined) return 'unknown command: /pm-save'
        if (result.value.result.kind === 'error') return result.value.result.text ?? 'command failed'
        return null
      },
      uploadToFeishu: async (card) => {
        const result = await ctx.remote.commands.execute(sessionId, `/pm-feishu ${JSON.stringify(card)}`, [])
        if (!result.ok) return null
        if (result.value === undefined) return null
        if (result.value.result.kind === 'error') return null
        // Extract URL from success message
        const match = result.value.result.text?.match(/🔗\s+(https:\/\/[^\s]+)/)
        return match?.[1] ?? null
      },
    }),
  }, PmWorkbenchView))
}
