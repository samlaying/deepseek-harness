import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { PmWorkbenchView } from './PmWorkbenchView.tsx'

export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  // Register the PM Workbench view tab into 'conversation.view'
  ctx.slots.register({
    name: 'conversation.view',
    id: 'pm-workbench',
    order: 10,
    label: () => 'PM 工作台',
    inject: (sessionId: string) => ({ sessionId }),
  }, PmWorkbenchView)
}
