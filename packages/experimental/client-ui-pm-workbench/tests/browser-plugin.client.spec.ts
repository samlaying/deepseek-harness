/**
 * ui-pm-workbench browser half: occupies one conversation.view tab.
 */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import { PmWorkbenchView } from '../src/client/PmWorkbenchView.tsx'
import type { PmWorkbenchInjected } from '../src/client/index.ts'
import { apply, inject } from '../src/client/index.ts'
import { en } from '../src/client/locales.ts'
import { apply as nodeApply } from '../src/index.ts'

const SID = 's-pm' as SessionId

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({
    name: 'root',
    children: { 'conversation.view': { kind: 'list', scope: 'session' } },
  } as never, () => null)
  const execute = vi.fn((_sessionId: SessionId, line: string) => {
    if (line.startsWith('/pm-save {')) {
      return Promise.resolve({
        ok: true as const,
        value: { commandId: 'c2', result: { kind: 'error' as const, text: 'bad card' } },
      })
    }
    return Promise.resolve({
      ok: true as const,
      value: { commandId: 'c1', result: { kind: 'success' as const } },
    })
  })
  const commandsRemote = { execute }
  const pickDirectory = vi.fn(async () => '/abs/shop')
  ctx.provide('remote', { commands: commandsRemote })
  ctx.provide('remote.commands', commandsRemote)
  ctx.provide('locale', new LocaleRuntime(ctx))
  ctx.provide('uiWorkspace', { pickDirectory })
  return { ctx, slots, execute, pickDirectory }
}

describe('client-ui-pm-workbench browser apply', () => {
  it('declares every service it binds', () => {
    expect(inject).toEqual(['slots', 'remote', 'remote.commands', 'locale', 'uiWorkspace'])
  })

  it('node-half apply is an intentional no-op', () => {
    expect(() => { nodeApply() }).not.toThrow()
  })

  it('registers the view, runs board commands, and unregisters on teardown', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const entry = b.slots.entries('conversation.view')[0]!
    expect(entry.options.id).toBe('pm-workbench')
    expect(typeof entry.options.label === 'function' ? entry.options.label() : entry.options.label).toBe(en['view.label'])
    expect(entry.component).toBe(PmWorkbenchView)
    const injected = (entry.inject as unknown as (id: SessionId) => PmWorkbenchInjected)(SID)

    await expect(injected.pickFolder()).resolves.toBe('/abs/shop')
    expect(b.pickDirectory).toHaveBeenCalled()
    await expect(injected.openProject('/abs/shop')).resolves.toBeNull()
    expect(b.execute).toHaveBeenLastCalledWith(SID, `/pm-project ${JSON.stringify('/abs/shop')}`, [])

    b.execute.mockResolvedValueOnce({
      ok: false,
      error: new RemoteError('session/not-found', 'gone', { sessionId: SID }),
    } as never)
    await expect(injected.openProject('shop')).resolves.toBe('gone (session/not-found)')

    b.execute.mockResolvedValueOnce({ ok: true, value: undefined } as never)
    await expect(injected.openProject('shop')).resolves.toBe('unknown command: /pm-project')

    b.execute.mockResolvedValueOnce({
      ok: true,
      value: { commandId: 'c0', result: { kind: 'error' as const } },
    } as never)
    await expect(injected.openProject('shop')).resolves.toBe('command failed')

    await expect(injected.saveCard({
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# x',
      x: 0,
      y: 0,
      width: 400,
      height: 240,
    })).resolves.toBe('bad card')

    b.execute.mockResolvedValueOnce({ ok: true, value: undefined } as never)
    await expect(injected.saveCard({
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# x',
      x: 0,
      y: 0,
      width: 400,
      height: 240,
    })).resolves.toBe('unknown command: /pm-save')

    b.execute.mockResolvedValueOnce({
      ok: true,
      value: { commandId: 'c3', result: { kind: 'error' as const } },
    } as never)
    await expect(injected.saveCard({
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# x',
      x: 0,
      y: 0,
      width: 400,
      height: 240,
    })).resolves.toBe('command failed')

    b.execute.mockResolvedValueOnce({
      ok: false,
      error: new RemoteError('session/not-found', 'gone', { sessionId: SID }),
    } as never)
    await expect(injected.saveCard({
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# x',
      x: 0,
      y: 0,
      width: 400,
      height: 240,
    })).resolves.toBe('gone (session/not-found)')

    b.execute.mockResolvedValueOnce({
      ok: true,
      value: { commandId: 'c5', result: { kind: 'success' as const } },
    } as never)
    await expect(injected.saveCard({
      projectId: 'shop',
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# x',
      x: 0,
      y: 0,
      width: 400,
      height: 240,
    })).resolves.toBeNull()

    await fiber.dispose()
    expect(b.slots.entries('conversation.view')).toHaveLength(0)
  })
})
