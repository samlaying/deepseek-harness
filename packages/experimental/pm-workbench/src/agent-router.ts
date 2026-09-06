/**
 * PM Workbench Agent Router: LLM-driven intelligent routing and automation
 *
 * This module automatically:
 * 1. Analyzes user messages with LLM to classify intent
 * 2. Creates cards proactively based on insights
 * 3. Triggers skill execution when needed
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { upsertCard } from './board.ts'
import type { PmBoardSnapshot, PmCardKind } from './types.ts'

interface IntentAnalysis {
  intent: 'skill' | 'insight' | 'question' | 'normal'
  confidence: number
  skillName?: string
  cardType?: PmCardKind
  cardTitle?: string
  cardContent?: string
  reasoning?: string
}

function extractUserMessageText(event: SessionEvent): string | null {
  if (event.type !== 'user/message') return null
  if (!('content' in event.data) || !Array.isArray(event.data.content)) return null

  const textBlocks = event.data.content.filter(
    (block: unknown): block is { type: 'text'; text: string } =>
      typeof block === 'object' && block !== null && 'type' in block && block.type === 'text',
  )

  return textBlocks.map(block => block.text).join('\n')
}

/**
 * Use LLM to analyze user message intent and determine next actions
 */
async function analyzeIntent(
  ctx: Context,
  userMessage: string,
  board: PmBoardSnapshot | null,
): Promise<IntentAnalysis> {
  const boardContext = board
    ? `当前 PM 画板: 项目 ${board.projectId}，已有 ${board.cards.length} 张卡片\n` +
      board.cards.map(c => `- ${c.kind}: ${c.title}`).join('\n')
    : '尚未打开 PM 项目'

  const systemPrompt = `你是 PM Workbench 的智能路由助手。分析用户消息，判断最佳行动。

用户消息: "${userMessage}"

${boardContext}

请分析并返回 JSON（不要 markdown 代码块）:
{
  "intent": "skill" | "insight" | "question" | "normal",
  "confidence": 0.0-1.0,
  "skillName": "如果 intent=skill，建议的 skill 名称",
  "cardType": "如果 intent=insight，建议的卡片类型: thought/template/doc/memory",
  "cardTitle": "如果 intent=insight，建议的卡片标题",
  "cardContent": "如果 intent=insight，建议的卡片内容（markdown）",
  "reasoning": "简短解释"
}

intent 判断标准:
- skill: 用户明确要执行任务（"运行测试"、"分析代码"、"重构X"）
- insight: 用户提供了重要见解/决策/模板，应该记录到卡片
- question: 用户在提问
- normal: 普通对话

只返回 JSON，不要其他内容。`

  try {
    let responseText = ''
    const message = createUserMessage({
      content: [{ type: 'text', text: systemPrompt }],
      source: { kind: 'plugin', plugin: 'pm-workbench' },
    })

    for await (const chunk of ctx.llm.stream({
      provider: 'deepseek',
      model: 'deepseek-chat',
      messages: [message],
      temperature: 0.3,
      maxTokens: 500,
    })) {
      if (chunk.type === 'text-delta') {
        responseText += chunk.text
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      ctx.logger.warn('pm-workbench: LLM response is not valid JSON', responseText)
      return { intent: 'normal', confidence: 0 }
    }

    const parsed = JSON.parse(jsonMatch[0]) as IntentAnalysis
    return parsed
  } catch (error) {
    ctx.logger.warn('pm-workbench: intent analysis failed', error)
    return { intent: 'normal', confidence: 0 }
  }
}

/**
 * Auto-create a card based on LLM analysis
 */
async function autoCreateCard(
  ctx: Context,
  session: Session,
  board: PmBoardSnapshot,
  analysis: IntentAnalysis,
): Promise<void> {
  if (!analysis.cardType || !analysis.cardTitle || !analysis.cardContent) return
  if (!session.header.cwd) return

  const cardId = `auto-${analysis.cardType}-${Date.now()}`
  const positions = {
    thought: { x: 360, y: 44 },
    template: { x: 360, y: 380 },
    doc: { x: 720, y: 44 },
    memory: { x: 720, y: 380 },
  }

  const pos = positions[analysis.cardType] || { x: 360, y: 44 }

  try {
    await upsertCard(session.header.cwd, {
      projectId: board.projectId,
      id: cardId,
      kind: analysis.cardType,
      title: analysis.cardTitle,
      markdown: analysis.cardContent,
      x: pos.x,
      y: pos.y,
      width: 380,
      height: 320,
    })

    ctx.logger.info(`pm-workbench: auto-created ${analysis.cardType} card: ${analysis.cardTitle}`)
  } catch (error) {
    ctx.logger.warn('pm-workbench: failed to auto-create card', error)
  }
}

/**
 * Trigger skill execution by injecting a message
 */
function triggerSkill(agent: Agent, skillName: string, reasoning: string): void {
  agent.inject(createUserMessage({
    content: [{
      type: 'text',
      text: `[PM 智能路由] 检测到需要执行: ${skillName}\n原因: ${reasoning}\n\n请立即执行该技能。`,
    }],
    source: { kind: 'plugin', plugin: 'pm-workbench' },
  }))
}

/**
 * Provide context for answering questions
 */
function provideContext(agent: Agent, board: PmBoardSnapshot, question: string): void {
  const relevantCards = board.cards.filter(card =>
    card.kind === 'memory' || card.kind === 'doc' ||
    card.title.toLowerCase().includes(question.toLowerCase().slice(0, 10)),
  )

  if (relevantCards.length === 0) return

  const context = relevantCards.map(card =>
    `### ${card.title} (${card.kind})\n${card.markdown}`,
  ).join('\n\n')

  agent.inject(createUserMessage({
    content: [{
      type: 'text',
      text: `[PM 智能路由] 从画板找到相关上下文:\n\n${context}\n\n请结合这些信息回答用户的问题。`,
    }],
    source: { kind: 'plugin', plugin: 'pm-workbench' },
  }))
}

/**
 * Main router: analyze and take action
 */
async function routeMessage(
  ctx: Context,
  agent: Agent,
  userMessage: string,
): Promise<void> {
  const board = ctx.sessionProjections.stateOf(agent.session, 'pmWorkbench') as PmBoardSnapshot | null

  // Analyze intent with LLM
  const analysis = await analyzeIntent(ctx, userMessage, board)

  ctx.logger.info(`pm-workbench: intent=${analysis.intent}, confidence=${analysis.confidence}, reasoning=${analysis.reasoning || 'N/A'}`)

  // Only act on high-confidence results
  if (analysis.confidence < 0.6) return

  switch (analysis.intent) {
    case 'skill':
      if (analysis.skillName) {
        triggerSkill(agent, analysis.skillName, analysis.reasoning || '')
      }
      break

    case 'insight':
      if (board) {
        await autoCreateCard(ctx, agent.session, board, analysis)
      }
      break

    case 'question':
      if (board) {
        provideContext(agent, board, userMessage)
      }
      break

    case 'normal':
      // No special action
      break
  }
}

/**
 * Find agent for a session
 */
function findAgent(ctx: Context, session: Session): Agent | null {
  for (const agent of ctx.agents.list()) {
    if (agent.session.id === session.id) {
      return agent
    }
  }
  return null
}

/**
 * Register LLM-driven agent router
 */
export function registerAgentRouter(ctx: Context): void {
  ctx.on('session/event', async (session, event) => {
    const userMessage = extractUserMessageText(event)
    if (!userMessage) return

    // Skip plugin messages to avoid loops
    if ('source' in event.data && typeof event.data.source === 'object' &&
        event.data.source !== null && 'kind' in event.data.source &&
        event.data.source.kind === 'plugin') {
      return
    }

    const agent = findAgent(ctx, session)
    if (!agent) return

    await routeMessage(ctx, agent, userMessage)
  })
}
