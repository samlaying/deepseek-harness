/**
 * Experimental PM Workbench: model tools, slash commands, a prompt board
 * index, and a Session projection over workspace-local project boards.
 *
 * @module @deepseek-ai/dsh-experimental-pm-workbench
 */

import { mkdirSync, watch, type FSWatcher } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'
import { z as zod } from 'zod'
import type { ZodType } from 'zod'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-llm'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-commands'
import {
  loadBoard, readCurrentProject, selectProject, upsertCard, folderOf, PM_PROJECT_BOARD,
} from './board.ts'
import { PM_CARD_KINDS, type PmBoardSnapshot } from './types.ts'
import { registerAgentRouter } from './agent-router.ts'

export type * from './types.ts'

/**
 * Initial projected board before any `pm-workbench/board` event.
 * @returns `null`, meaning no project is open yet.
 */
export function emptyPmBoard(): PmBoardSnapshot | null {
  return null
}

/**
 * Bound to `fs.watch` `'error'` so a removed workspace directory does not
 * crash the Host process.
 */
export function ignorePmWatchError(): void {}

/** Cordis plugin name. */
export const name = 'pm-workbench'
/** Services required by the board tools, projection, and prompt index. */
export const inject = ['agents', 'tools', 'sessionProjections', 'systemPrompt', 'llm']

const CARD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    kind: { type: 'string', required: true, enum: [...PM_CARD_KINDS] },
    title: { type: 'string', required: true },
    markdown: { type: 'string', required: true },
    x: { type: 'number', required: true },
    y: { type: 'number', required: true },
    width: { type: 'number', required: true },
    height: { type: 'number', required: true },
  },
} as const

const BOARD_VALUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    projectId: { type: 'string', required: true },
    folder: { type: 'string', required: true },
    folders: { type: 'object', required: true, additionalProperties: true },
    projects: { type: 'array', required: true, items: { type: 'string' } },
    cards: { type: 'array', required: true, items: CARD_SCHEMA },
  },
} as const

const boardProjectionSchema: ZodType<PmBoardSnapshot | null> = zod.union([
  zod.object({
    projectId: zod.string().min(1),
    folder: zod.string().min(1),
    folders: zod.record(zod.string(), zod.string()),
    projects: zod.array(zod.string()),
    cards: zod.array(zod.object({
      id: zod.string().min(1),
      kind: zod.enum(PM_CARD_KINDS),
      title: zod.string().min(1),
      markdown: zod.string(),
      x: zod.number(),
      y: zod.number(),
      width: zod.number(),
      height: zod.number(),
    })),
  }),
  zod.null(),
])

function cwdOf(agent: Agent): string {
  const cwd = agent.session.header.cwd
  if (cwd === undefined || cwd === '') throw new Error('pm-workbench requires the Session working directory')
  return cwd
}

function sameSnapshot(left: PmBoardSnapshot | null | undefined, right: PmBoardSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function publishBoard(ctx: Context, agent: Agent, snapshot: PmBoardSnapshot): void {
  const current = ctx.sessionProjections.stateOf(agent.session, 'pmWorkbench')
  if (sameSnapshot(current, snapshot)) return
  agent.session.append('pm-workbench/board', snapshot)
}

function publishWorkspace(ctx: Context, cwd: string, snapshot: PmBoardSnapshot): void {
  for (const agent of ctx.agents.list()) {
    if (agent.session.header.cwd === cwd) publishBoard(ctx, agent, snapshot)
  }
}

function notifyAgent(agent: Agent, snapshot: PmBoardSnapshot, reason: string): void {
  const lines = snapshot.cards.map(card => `### ${card.title} (${card.kind}, ${card.id})\n\n${card.markdown}`)
  agent.inject(createUserMessage({
    content: [{
      type: 'text',
      text: `${reason} Project \`${snapshot.projectId}\`.\n\n${lines.join('\n\n')}`,
    }],
    source: { kind: 'plugin', plugin: name },
  }))
}

async function openProject(ctx: Context, agent: Agent, projectId: string): Promise<PmBoardSnapshot> {
  const cwd = cwdOf(agent)
  const id = await selectProject(cwd, projectId)
  const snapshot = await loadBoard(cwd, id)
  publishWorkspace(ctx, cwd, snapshot)
  return snapshot
}

async function writeCard(
  ctx: Context,
  agent: Agent,
  input: Parameters<typeof upsertCard>[1],
  notify: boolean,
): Promise<PmBoardSnapshot> {
  const cwd = cwdOf(agent)
  const snapshot = await upsertCard(cwd, input)
  publishWorkspace(ctx, cwd, snapshot)
  if (notify) notifyAgent(agent, snapshot, 'The operator edited a markdown card on the shared PM board.')
  return snapshot
}

function renderBoard(snapshot: {
  readonly projectId: string
  readonly folder: string
  readonly projects: readonly string[]
  readonly cards: readonly { readonly id: string; readonly kind: string; readonly title: string }[]
}): string {
  const cards = snapshot.cards.map(card => `- ${card.kind} ${card.id}: ${card.title}`).join('\n')
  return `PM Workbench project \`${snapshot.projectId}\` bound to \`${snapshot.folder}\`. Canvas files live in that folder's \`.pm-workbench/\`.\nProjects: ${
    snapshot.projects.join(', ')
  }\nCards:\n${cards || '(none)'}\nUse pm_upsert_card to pin thought, template, doc, or memory markdown. Operator edits write the same files.`
}

/**
 * Register the board projection, tools, prompt index, optional commands, and
 * a workspace file watcher that republishes the shared board.
 * @param ctx - host context carrying agents, tools, projections, and prompts.
 */
export function apply(ctx: Context): void {
  // Register intelligent agent router for automated skill routing and memory updates
  registerAgentRouter(ctx)

  ctx.sessionProjections.register<'pmWorkbench', PmBoardSnapshot | null>({
    key: 'pmWorkbench',
    stateSchema: boardProjectionSchema,
    init: emptyPmBoard,
    apply: (state, event) => event.type === 'pm-workbench/board' ? event.data : state,
    wire: { viewSchema: boardProjectionSchema, view: state => state },
    stateVersion: 1,
  })

  ctx.systemPrompt.section({
    name: 'pm-workbench:board',
    order: 85,
    text: (context) => {
      if (context.agent === undefined) return ''
      const cwd = context.agent.session.header.cwd
      if (cwd === undefined) return ''
      const projected = ctx.sessionProjections.stateOf(context.agent.session, 'pmWorkbench')
      if (projected == null) {
        return 'PM Workbench is available. Call pm_open_project with an absolute folder path (the operator binds a directory in Finder) or an already-bound project id. One bound folder is one board, shared by every Session in this working directory. Canvas files live in `<folder>/.pm-workbench/`.'
      }
      return renderBoard(projected)
    },
  })

  ctx.tools.register(defineTool({
    name: 'pm_open_project',
    description: 'Bind or reopen one PM Workbench project. One bound folder is one shared infinite canvas. Call this before writing cards.',
    parameters: {
      projectId: {
        type: 'string',
        required: true,
        description: 'Absolute folder path from the OS directory picker, or an already-bound project id.',
      },
    },
    output: { schema: BOARD_VALUE_SCHEMA, render: (_args, value) => [{ type: 'text', text: renderBoard(value) }] },
    async execute(args, exec) {
      if (exec.agent === undefined) throw new Error('pm_open_project requires an owning agent session')
      return await openProject(ctx, exec.agent, args.projectId)
    },
    presentCall: args => ({ card: 'generic', title: 'Open PM project', kind: 'other', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'pm_list_board',
    description: 'Read the current shared PM Workbench board (or a named project) from local files.',
    parameters: {
      projectId: {
        type: 'string',
        description: 'Project to read. Defaults to the workspace current project.',
      },
    },
    output: { schema: BOARD_VALUE_SCHEMA, render: (_args, value) => [{ type: 'text', text: renderBoard(value) }] },
    async execute(args, exec) {
      if (exec.agent === undefined) throw new Error('pm_list_board requires an owning agent session')
      const cwd = cwdOf(exec.agent)
      const projectId = args.projectId ?? await readCurrentProject(cwd)
      if (projectId === undefined) throw new Error('no current PM project; call pm_open_project first')
      const snapshot = await loadBoard(cwd, projectId)
      publishWorkspace(ctx, cwd, snapshot)
      return snapshot
    },
    presentCall: args => ({ card: 'generic', title: 'List PM board', kind: 'other', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'pm_upsert_card',
    description: 'Create or replace one markdown card on a project board. Kinds: thought (approach), template, doc (deliverable), memory (proactive project facts). Write early and update as you stream conclusions so the canvas stays current.',
    parameters: {
      projectId: {
        type: 'string',
        required: true,
        description: 'Project whose shared board receives the card.',
      },
      id: {
        type: 'string',
        required: true,
        description: 'Stable card id used as the markdown file name, such as prd or memory-boss.',
      },
      kind: {
        type: 'string',
        required: true,
        enum: [...PM_CARD_KINDS],
        description: 'thought | template | doc | memory.',
      },
      title: { type: 'string', required: true, description: 'Short card title shown on the canvas.' },
      markdown: { type: 'string', required: true, description: 'Full markdown body. Send the complete current text.' },
      x: { type: 'number', description: 'Canvas x in pixels.' },
      y: { type: 'number', description: 'Canvas y in pixels.' },
      width: { type: 'number', description: 'Card width in pixels.' },
      height: { type: 'number', description: 'Card height in pixels.' },
    },
    output: { schema: BOARD_VALUE_SCHEMA, render: (_args, value) => [{ type: 'text', text: renderBoard(value) }] },
    async execute(args, exec) {
      if (exec.agent === undefined) throw new Error('pm_upsert_card requires an owning agent session')
      return await writeCard(ctx, exec.agent, args, false)
    },
    presentCall: args => ({ card: 'generic', title: 'Update PM card', kind: 'other', rawInput: args }),
  }))

  ctx.inject(['commands'], (commandCtx) => {
    commandCtx.commands.register({
      name: 'pm-project',
      description: 'Bind a folder as the shared PM Workbench project board',
      input: { hint: '<folder-or-id>' },
      handler: async ({ agent, rawInput }) => {
        const trimmed = rawInput.trim()
        if (trimmed === '') return { kind: 'error', text: 'Usage: /pm-project <folder-or-id>' }
        let target = trimmed
        if (trimmed.startsWith('"') || trimmed.startsWith('{')) {
          try {
            const parsed: unknown = JSON.parse(trimmed)
            if (typeof parsed !== 'string' || parsed === '') {
              return { kind: 'error', text: '/pm-project JSON must be a folder path or project id' }
            }
            target = parsed
          } catch {
            return { kind: 'error', text: '/pm-project expects a JSON string path' }
          }
        }
        try {
          const snapshot = await openProject(ctx, agent, target)
          return { kind: 'success', text: renderBoard(snapshot) }
        } catch (error) {
          return { kind: 'error', text: String(error) }
        }
      },
    })
    commandCtx.commands.register({
      name: 'pm-save',
      description: 'Write one markdown card on the shared PM board from the canvas editor',
      input: { hint: '<json>' },
      handler: async ({ agent, rawInput }) => {
        let parsed: {
          projectId?: string
          id?: string
          kind?: string
          title?: string
          markdown?: string
          x?: number
          y?: number
          width?: number
          height?: number
        }
        try {
          parsed = JSON.parse(rawInput) as typeof parsed
        } catch {
          return { kind: 'error', text: '/pm-save expects a JSON object' }
        }
        if (parsed.projectId === undefined || parsed.id === undefined
          || parsed.kind === undefined || parsed.title === undefined || parsed.markdown === undefined) {
          return { kind: 'error', text: '/pm-save JSON requires projectId, id, kind, title, markdown' }
        }
        try {
          const snapshot = await writeCard(ctx, agent, {
            projectId: parsed.projectId,
            id: parsed.id,
            kind: parsed.kind,
            title: parsed.title,
            markdown: parsed.markdown,
            ...parsed.x === undefined ? {} : { x: parsed.x },
            ...parsed.y === undefined ? {} : { y: parsed.y },
            ...parsed.width === undefined ? {} : { width: parsed.width },
            ...parsed.height === undefined ? {} : { height: parsed.height },
          }, true)
          return { kind: 'success', text: renderBoard(snapshot) }
        } catch (error) {
          return { kind: 'error', text: String(error) }
        }
      },
    })
    commandCtx.commands.register({
      name: 'pm-feishu',
      description: 'Upload PM card content to Feishu document',
      input: { hint: '<json>' },
      handler: async ({ rawInput }) => {
        let parsed: { title?: string; markdown?: string }
        try {
          parsed = JSON.parse(rawInput) as typeof parsed
        } catch {
          return { kind: 'error', text: '/pm-feishu expects a JSON object' }
        }
        if (parsed.title === undefined || parsed.markdown === undefined) {
          return { kind: 'error', text: '/pm-feishu JSON requires title and markdown' }
        }
        try {
          const url = await uploadToFeishu(parsed.title, parsed.markdown)
          return { kind: 'success', text: `✅ 已上传到飞书！\n\n📄 ${parsed.title}\n🔗 ${url}` }
        } catch (error) {
          return { kind: 'error', text: `上传失败: ${String(error)}` }
        }
      },
    })
  })

  /**
   * Upload markdown content to Feishu document
   */
  async function uploadToFeishu(title: string, markdown: string): Promise<string> {
    // 从环境变量获取飞书配置
    const appId = process.env.FEISHU_APP_ID
    const appSecret = process.env.FEISHU_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error('缺少飞书配置：请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量')
    }

    // 1. 获取 tenant_access_token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    })

    const tokenData = await tokenResponse.json() as { code: number; tenant_access_token?: string; msg?: string }
    if (tokenData.code !== 0 || !tokenData.tenant_access_token) {
      throw new Error(`获取 token 失败: ${tokenData.msg || 'unknown'}`)
    }

    const token = tokenData.tenant_access_token

    // 2. 创建飞书文档
    const createDocResponse = await fetch('https://open.feishu.cn/open-apis/docx/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        folder_token: '', // 空字符串表示创建在根目录
      }),
    })

    const createDocData = await createDocResponse.json() as {
      code: number
      data?: { document: { document_id: string; revision_id: number } }
      msg?: string
    }

    if (createDocData.code !== 0 || !createDocData.data) {
      throw new Error(`创建文档失败: ${createDocData.msg || 'unknown'}`)
    }

    const documentId = createDocData.data.document.document_id

    // 3. 批量更新文档内容 - 简单处理：将 markdown 转为纯文本段落
    const paragraphs = markdown.split('\n\n').filter(p => p.trim())
    const requests = paragraphs.map((text, index) => ({
      request_id: `block_${index}`,
      action: 'insert',
      insert: {
        location: {
          zone_id: 'body',
          index: index,
        },
        block_type: 'text',
        text: {
          style: {},
          elements: [{ text_run: { content: text.trim() } }],
        },
      },
    }))

    await fetch(`https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/blocks/batch_update`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    })

    // 返回文档链接
    return `https://feishu.cn/docx/${documentId}`
  }

  const watchers = new Map<string, FSWatcher>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const republish = (cwd: string): void => {
    const pending = timers.get(cwd)
    if (pending !== undefined) clearTimeout(pending)
    timers.set(cwd, setTimeout(() => {
      timers.delete(cwd)
      void (async () => {
        const projectId = await readCurrentProject(cwd)
        if (projectId === undefined) return
        const folder = await folderOf(cwd, projectId)
        watchFolder(cwd, `${folder}/${PM_PROJECT_BOARD}`)
        const snapshot = await loadBoard(cwd, projectId)
        publishWorkspace(ctx, cwd, snapshot)
      })().catch((error: unknown) => {
        ctx.logger.warn('pm-workbench watch failed: %o', error)
      })
    }, 50))
  }
  const watchFolder = (cwd: string, root: string): void => {
    const key = `${cwd}\0${root}`
    if (watchers.has(key)) return
    mkdirSync(root, { recursive: true })
    const watcher = watch(root, { recursive: true }, () => { republish(cwd) })
    watcher.on('error', ignorePmWatchError)
    watchers.set(key, watcher)
  }
  const watchWorkspace = (cwd: string): void => {
    watchFolder(cwd, `${cwd}/.pm-workbench`)
    republish(cwd)
  }
  ctx.on('agent/created', ({ agent }) => {
    const cwd = agent.session.header.cwd
    if (cwd !== undefined) watchWorkspace(cwd)
  })
  for (const agent of ctx.agents.list()) {
    const cwd = agent.session.header.cwd
    if (cwd !== undefined) watchWorkspace(cwd)
  }
  ctx.effect(() => () => {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    for (const watcher of watchers.values()) watcher.close()
    watchers.clear()
  }, 'pm-workbench: board watchers')
}
