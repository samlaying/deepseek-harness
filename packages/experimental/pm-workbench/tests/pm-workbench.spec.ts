import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry, { Inbox } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SESSION_FORMAT_VERSION, Session, SessionId } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as plugin from '../src/index.ts'
import type { PmBoardSnapshot } from '../src/types.ts'

const signal = new AbortController().signal
let cwd: string | undefined
let ctx: Context | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  ctx = undefined
  if (cwd !== undefined) await rm(cwd, { recursive: true, force: true })
  cwd = undefined
})

function agentOf(dir: string, id = 'pm-agent'): Agent {
  const session = Session.create(SessionId(id), undefined, {
    version: SESSION_FORMAT_VERSION,
    id: SessionId(id),
    createdAt: Date.now(),
    cwd: dir,
    isSeeded: false,
  })
  const injected: unknown[] = []
  const agent = {
    id: SessionId(id),
    options: {},
    session,
    inbox: new Inbox(session, { inserted: () => {}, discarded: () => {}, claimed: () => {} }),
    status: 'idle',
    followup: () => {},
    steer: () => {},
    inject: (message: unknown) => { injected.push(message) },
    send: () => {},
    cancel() {},
    runMaintenance: (task: (signal: AbortSignal) => unknown) => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
    injected,
  }
  return agent as unknown as Agent
}

async function setup(dir: string, register = true): Promise<{ context: Context; agent: Agent }> {
  const context = new Context()
  ctx = context
  await context.plugin(AgentRegistry)
  await context.plugin(SystemPrompt)
  await context.plugin(ToolRuntime)
  await context.plugin(SessionProjectionRegistry)
  await context.plugin(CommandRuntime)
  const agent = agentOf(dir)
  if (register) context.agents.register(agent)
  await context.plugin(plugin)
  return { context, agent }
}

let calls = 0
function execute(context: Context, name: string, args: unknown, agent: Agent) {
  return context.tools.execute({
    signal,
    callId: ToolCallId(`pm-${++calls}`),
    name,
    arguments: args,
    agent,
  })
}

async function projectDir(dir: string, name: string): Promise<string> {
  const folder = join(dir, name)
  await mkdir(folder, { recursive: true })
  return folder
}

describe('pm-workbench plugin', () => {
  it('opens a project, upserts a card, and projects the shared board', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const before = await context.systemPrompt.assemble({ agent })
    expect(before.sections.some(section => section.text.includes('pm_open_project'))).toBe(true)
    const shop = await projectDir(cwd, 'shop')
    const opened = await execute(context, 'pm_open_project', { projectId: shop }, agent)
    expect(opened.isError).toBe(false)
    expect(context.sessionProjections.snapshot(agent.session).values.pmWorkbench?.projectId).toBe('shop')
    const afterOpen = await context.systemPrompt.assemble({ agent })
    expect(afterOpen.sections.some(section => section.text.includes('Cards:\n(none)'))).toBe(true)
    const listed = await execute(context, 'pm_list_board', {}, agent)
    expect(listed.isError).toBe(false)
    const written = await execute(context, 'pm_upsert_card', {
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# PRD\n\nShip it.\n',
    }, agent)
    expect(written.isError).toBe(false)
    if (written.isError) throw new Error('expected upsert')
    const snapshot = context.sessionProjections.stateOf(agent.session, 'pmWorkbench')
    expect(snapshot?.projectId).toBe('shop')
    expect(snapshot?.cards[0]?.markdown).toContain('Ship it')
    const assembly = await context.systemPrompt.assemble({ agent })
    expect(assembly.sections.some(section => section.text.includes('shop'))).toBe(true)
  })

  it('rejects tool calls without an agent or a working directory', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const missing = await context.tools.execute({
      signal,
      callId: ToolCallId('pm-none'),
      name: 'pm_open_project',
      arguments: { projectId: 'x' },
    })
    expect(missing.isError).toBe(true)
    const blank = Session.create(SessionId('no-cwd'))
    const lost = { ...agent, session: blank } as Agent
    const result = await execute(context, 'pm_list_board', {}, lost)
    expect(result.isError).toBe(true)
    const listed = await execute(context, 'pm_list_board', {}, agent)
    expect(listed.isError).toBe(true)
    const upsertMissing = await context.tools.execute({
      signal,
      callId: ToolCallId('pm-upsert-none'),
      name: 'pm_upsert_card',
      arguments: { projectId: 'x', id: 'y', kind: 'doc', title: 'Y', markdown: 'z' },
    })
    expect(upsertMissing.isError).toBe(true)
    const listMissing = await context.tools.execute({
      signal,
      callId: ToolCallId('pm-list-none'),
      name: 'pm_list_board',
      arguments: {},
    })
    expect(listMissing.isError).toBe(true)
    expect(context.tools.get('pm_open_project')!.presentCall!({ projectId: 'x' })?.title).toBe('Open PM project')
    expect(context.tools.get('pm_list_board')!.presentCall!({})?.title).toBe('List PM board')
    context.tools.get('pm_upsert_card')!.presentCall?.({
      projectId: 'x',
      id: 'y',
      kind: 'doc',
      title: 'Y',
      markdown: 'z',
    })
    const none = await context.systemPrompt.assemble({})
    expect(none.sections.find(section => section.name === 'pm-workbench:board')?.text).toBe('')
  })

  it('opens and saves through slash commands and injects operator edits', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const checkout = await projectDir(cwd, 'checkout')
    const opened = await context.commands.execute(agent, `/pm-project ${JSON.stringify(checkout)}`, [], signal)
    expect(opened?.result.kind).toBe('success')
    const unquoted = await context.commands.execute(agent, `/pm-project ${checkout}`, [], signal)
    expect(unquoted?.result.kind).toBe('success')
    const bad = await context.commands.execute(agent, '/pm-project', [], signal)
    expect(bad?.result.kind).toBe('error')
    const invalid = await context.commands.execute(agent, '/pm-save nope', [], signal)
    expect(invalid?.result.kind).toBe('error')
    const unsafe = await context.commands.execute(agent, '/pm-project NOPE', [], signal)
    expect(unsafe?.result.kind).toBe('error')
    const notString = await context.commands.execute(agent, '/pm-project {}', [], signal)
    expect(notString?.result.kind).toBe('error')
    const brokenJson = await context.commands.execute(agent, '/pm-project "', [], signal)
    expect(brokenJson?.result.kind).toBe('error')
    const emptyJson = await context.commands.execute(agent, '/pm-project ""', [], signal)
    expect(emptyJson?.result.kind).toBe('error')
    const reopen = await context.commands.execute(agent, '/pm-project checkout', [], signal)
    expect(reopen?.result.kind).toBe('success')
    const incomplete = await context.commands.execute(agent, '/pm-save {}', [], signal)
    expect(incomplete?.result.kind).toBe('error')
    const badKind = await context.commands.execute(agent, `/pm-save ${JSON.stringify({
      projectId: 'checkout',
      id: 'x',
      kind: 'slide',
      title: 'X',
      markdown: 'x',
    })}`, [], signal)
    expect(badKind?.result.kind).toBe('error')
    const saved = await context.commands.execute(agent, `/pm-save ${JSON.stringify({
      projectId: 'checkout',
      id: 'memory',
      kind: 'memory',
      title: 'Boss',
      markdown: 'Prefers tables.\n',
    })}`, [], signal)
    expect(saved?.result.kind).toBe('success')
    const injected = (agent as unknown as { injected: Array<{ content: Array<{ text: string }> }> }).injected
    expect(injected.at(-1)?.content[0]?.text).toContain('Prefers tables')
  })

  it('shares one disk board across two Sessions in the same cwd', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const other = agentOf(cwd, 'pm-other')
    context.agents.register(other)
    await execute(context, 'pm_open_project', { projectId: await projectDir(cwd, 'shared') }, agent)
    await execute(context, 'pm_upsert_card', {
      projectId: 'shared',
      id: 'thought',
      kind: 'thought',
      title: 'Approach',
      markdown: 'Split the PRD.\n',
    }, agent)
    const copy = context.sessionProjections.stateOf(other.session, 'pmWorkbench')
    expect(copy?.cards[0]?.title).toBe('Approach')
  })

  it('republishes when the local board files change', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const watch = await projectDir(cwd, 'watch')
    await execute(context, 'pm_open_project', { projectId: watch }, agent)
    await writeFile(join(watch, '.pm-workbench', 'cards', 'live.md'), '# Live\n')
    await writeFile(join(watch, '.pm-workbench', 'cards', 'live.md'), '# Live again\n')
    await writeFile(join(watch, '.pm-workbench', 'layout.json'), `${JSON.stringify({
      cards: [{ id: 'live', kind: 'doc', title: 'Live', x: 10, y: 10, width: 400, height: 240 }],
    })}\n`)
    await vi.waitFor(() => {
      const snapshot = context.sessionProjections.stateOf(agent.session, 'pmWorkbench') as PmBoardSnapshot | null
      expect(snapshot?.cards.some(card => card.id === 'live' && card.markdown.includes('Live'))).toBe(true)
    })
    const board = await import('../src/board.ts')
    const loadSpy = vi.spyOn(board, 'loadBoard').mockRejectedValueOnce(new Error('boom'))
    const warn = vi.spyOn(context.logger, 'warn')
    await writeFile(join(watch, '.pm-workbench', 'cards', 'live.md'), '# Live 2\n')
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalled()
    })
    loadSpy.mockRestore()
    warn.mockRestore()
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), JSON.stringify({ folders: {} }))
    await writeFile(join(watch, '.pm-workbench', 'cards', 'live.md'), '# Live 3\n')
    await new Promise(resolve => setTimeout(resolve, 80))
  })

  it('lists a named project, skips duplicate publishes, and watches agents created later', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const { context, agent } = await setup(cwd)
    const alpha = await projectDir(cwd, 'alpha')
    await execute(context, 'pm_open_project', { projectId: alpha }, agent)
    await execute(context, 'pm_open_project', { projectId: alpha }, agent)
    await execute(context, 'pm_upsert_card', {
      projectId: await projectDir(cwd, 'beta'),
      id: 'note',
      kind: 'template',
      title: 'Note',
      markdown: 'body',
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    }, agent)
    const named = await execute(context, 'pm_list_board', { projectId: 'alpha' }, agent)
    expect(named.isError).toBe(false)
    const emptyPrompt = await context.systemPrompt.assemble({
      agent: { ...agent, session: Session.create(SessionId('no-cwd-header')) } as Agent,
    })
    expect(emptyPrompt.sections.find(section => section.name === 'pm-workbench:board')?.text).toBe('')
    const later = agentOf(cwd, 'pm-late')
    context.agents.register(later)
    const extra = await mkdtemp(join(tmpdir(), 'pm-plugin-extra-'))
    try {
      context.agents.register(agentOf(extra, 'pm-extra'))
    } finally {
      await rm(extra, { recursive: true, force: true })
    }
    await execute(context, 'pm_open_project', { projectId: 'alpha' }, later)
    const saved = await context.commands.execute(later, `/pm-save ${JSON.stringify({
      projectId: 'alpha',
      id: 'placed',
      kind: 'doc',
      title: 'Placed',
      markdown: 'ok',
      x: 9,
      y: 8,
      width: 7,
      height: 6,
    })}`, [], signal)
    expect(saved?.result.kind).toBe('success')
  })

  it('does not watch sessions that have no working directory', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-plugin-'))
    const context = new Context()
    ctx = context
    await context.plugin(AgentRegistry)
    await context.plugin(SystemPrompt)
    await context.plugin(ToolRuntime)
    await context.plugin(SessionProjectionRegistry)
    await context.plugin(CommandRuntime)
    const blank = {
      ...agentOf(cwd, 'pm-blank'),
      session: Session.create(SessionId('pm-blank')),
    } as Agent
    context.agents.register(blank)
    await context.plugin(plugin)
    context.agents.register({
      ...agentOf(cwd, 'pm-blank-2'),
      session: Session.create(SessionId('pm-blank-2')),
    } as Agent)
    expect(plugin.emptyPmBoard()).toBeNull()
    plugin.ignorePmWatchError()
    expect(context.sessionProjections.stateOf(blank.session, 'pmWorkbench')).toBeNull()
  })
})
