/**
 * PM Workbench Agent Router: Simplified intelligent routing and memory updates
 *
 * This module automatically updates memory cards when users provide new information.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { upsertCard } from './board.ts'
import type { PmBoardSnapshot } from './types.ts'

function extractUserMessageText(event: SessionEvent): string | null {
  if (event.type !== 'user/message') return null
  if (!('content' in event.data) || !Array.isArray(event.data.content)) return null

  const textBlocks = event.data.content.filter(
    (block: unknown): block is { type: 'text'; text: string } =>
      typeof block === 'object' && block !== null && 'type' in block && block.type === 'text',
  )

  return textBlocks.map(block => block.text).join('\n')
}

async function autoUpdateMemory(
  ctx: Context,
  session: Session,
  userMessage: string,
): Promise<void> {
  const board = ctx.sessionProjections.stateOf(session, 'pmWorkbench') as PmBoardSnapshot | null
  if (!board || !session.header.cwd) return

  // Simple heuristic: if message contains decision/fact keywords, add to memory
  const hasDecisionKeywords = /\b(decided|决定|记住|remember|important|重要|约定|agreed|确认)\b/i.test(userMessage)
  if (!hasDecisionKeywords) return

  try {
    const memoryCard = board.cards.find(card => card.kind === 'memory')
    const timestamp = new Date().toISOString().split('T')[0]
    const entry = `- ${userMessage}`

    const updatedMarkdown = memoryCard
      ? `${memoryCard.markdown}\n\n## Auto-update ${timestamp}\n${entry}`
      : `# 项目记忆\n\n## ${timestamp}\n${entry}`

    await upsertCard(session.header.cwd, {
      projectId: board.projectId,
      id: memoryCard?.id || 'memory-auto',
      kind: 'memory',
      title: memoryCard?.title || '项目记忆',
      markdown: updatedMarkdown,
      ...(memoryCard?.x !== undefined ? { x: memoryCard.x } : {}),
      ...(memoryCard?.y !== undefined ? { y: memoryCard.y } : {}),
      ...(memoryCard?.width !== undefined ? { width: memoryCard.width } : {}),
      ...(memoryCard?.height !== undefined ? { height: memoryCard.height } : {}),
    })

    ctx.logger.info(`pm-workbench: auto-updated memory for project ${board.projectId}`)
  } catch (error) {
    ctx.logger.warn('pm-workbench: failed to auto-update memory', error)
  }
}

/**
 * Register simplified agent router that auto-updates memory cards
 */
export function registerAgentRouter(ctx: Context): void {
  ctx.on('session/event', async (session, event) => {
    const userMessage = extractUserMessageText(event)
    if (userMessage) {
      await autoUpdateMemory(ctx, session, userMessage)
    }
  })
}
