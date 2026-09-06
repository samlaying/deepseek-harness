// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import { EMPTY_CHAT_SNAPSHOT } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PmBoardSnapshot } from '@deepseek-ai/dsh-experimental-pm-workbench/client'
import { PmWorkbenchView } from '../src/client/PmWorkbenchView.tsx'
import type { PmWorkbenchViewProps } from '../src/client/PmWorkbenchView.tsx'
import { en, type PmWorkbenchKey } from '../src/client/locales.ts'

afterEach(cleanup)

const board: PmBoardSnapshot = {
  projectId: 'shop',
  folder: '/abs/shop',
  folders: { shop: '/abs/shop', other: '/abs/other' },
  projects: ['shop', 'other', 'ghost'],
  cards: [{
    id: 'prd',
    kind: 'doc',
    title: 'PRD',
    markdown: '# Hello\n\nBody',
    x: 80,
    y: 80,
    width: 400,
    height: 240,
  }],
}

function chatWith(partial: string, user = 'hi'): ChatSnapshot {
  return {
    ...EMPTY_CHAT_SNAPSHOT,
    legacy: {
      ...EMPTY_CHAT_SNAPSHOT.legacy,
      nodes: [{
        kind: 'user',
        seq: 1,
        time: 0,
        content: [{ type: 'text', text: user }],
        source: { kind: 'user' },
      } as ChatSnapshot['legacy']['nodes'][number]],
      partial: partial === '' ? null : { turn: 1, step: 1, blocks: [{ kind: 'text', text: partial }] },
    },
  }
}

function renderView(
  over: Pick<PmWorkbenchViewProps, 'useProjection' | 'useChat' | 'pickFolder' | 'openProject' | 'saveCard'>,
) {
  return render(<PmWorkbenchView {...({
    sessionId: 's1' as never,
    viewRequest: null,
    openView: () => {},
    completeViewRequest: () => {},
    t: ((key: PmWorkbenchKey) => en[key]) as PmWorkbenchViewProps['t'],
    ...over,
  } as PmWorkbenchViewProps)} />)
}

describe('PmWorkbenchView', () => {
  it('opens a project, previews markdown, and saves an edit', async () => {
    const pickFolder = vi.fn(async () => '/abs/shop')
    const openProject = vi.fn(async () => null)
    const saveCard = vi.fn(async () => null)
    const screen = renderView({
      useProjection: () => board,
      useChat: ((select: (snapshot: ChatSnapshot) => unknown) => select(chatWith('# Live\n## Two\n### Three\n\nbody'))) as PmWorkbenchViewProps['useChat'],
      pickFolder,
      openProject,
      saveCard,
    })
    expect(screen.container.querySelector('[data-conversation-composer-overlay]')).toBeTruthy()
    expect(screen.getByText('PRD')).toBeTruthy()
    expect(screen.getByText('Hello')).toBeTruthy()
    expect(screen.getByText('Live')).toBeTruthy()
    expect(screen.getByText('Two')).toBeTruthy()
    expect(screen.getByText('Three')).toBeTruthy()
    const toggleBtn = screen.getByLabelText(en['projects.toggle'])
    expect(toggleBtn).toBeTruthy()
    fireEvent.click(toggleBtn)
    expect(screen.getByLabelText(en['projects.expand'])).toBeTruthy()
    fireEvent.click(screen.getByLabelText(en['projects.expand']))
    expect(screen.getByLabelText(en['projects.toggle'])).toBeTruthy()
    fireEvent.click(screen.getByText(en['projects.open']))
    await vi.waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('/abs/shop')
    })
    fireEvent.click(screen.getByText('ghost'))
    expect(openProject).toHaveBeenCalledWith('ghost')
    fireEvent.click(screen.getByText('/abs/other'))
    expect(openProject).toHaveBeenCalledWith('other')
    fireEvent.click(screen.getByText(en['card.edit']))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '# Edited' } })
    fireEvent.click(screen.getByText(en['card.save']))
    expect(saveCard).toHaveBeenCalledWith(expect.objectContaining({ markdown: '# Edited', projectId: 'shop' }))
    fireEvent.click(screen.getByText(en['card.preview']))
    fireEvent.pointerDown(screen.getByText('PRD'), { button: 0, pointerId: 7, clientX: 1, clientY: 1 })
    const canvas = screen.getByLabelText(en['canvas.title']).firstElementChild as HTMLElement
    canvas.setPointerCapture = () => undefined
    fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(canvas, { pointerId: 2, clientX: 12, clientY: 12 })
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 40, clientY: 50 })
    fireEvent.pointerUp(canvas, { pointerId: 9 })
    fireEvent.pointerUp(canvas, { pointerId: 1 })
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 80, clientY: 80 })
    expect(document.body.dataset.pmWorkbenchStandalone).toBe('true')
  })

  it('shows empty copy, bind-folder errors, and assistant plus heading preview', async () => {
    const openProject = vi.fn(async () => 'nope')
    const pickFolder = vi.fn()
      .mockRejectedValueOnce(new Error('denied'))
      .mockRejectedValueOnce('blocked')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('/abs/alpha')
    const snapshot = {
      ...EMPTY_CHAT_SNAPSHOT,
      legacy: {
        ...EMPTY_CHAT_SNAPSHOT.legacy,
        nodes: [
          {
            kind: 'user',
            seq: 1,
            time: 0,
            content: [{ type: 'image' }],
            source: { kind: 'user' },
          } as unknown as ChatSnapshot['legacy']['nodes'][number],
          {
            kind: 'assistant',
            seq: 2,
            time: 1,
            turn: 1,
            step: 1,
            blocks: [{ kind: 'reasoning', text: 'hidden' }, { kind: 'text', text: '## Title\n\n### Sub' }],
          } as ChatSnapshot['legacy']['nodes'][number],
          { kind: 'tool', seq: 3 } as unknown as ChatSnapshot['legacy']['nodes'][number],
        ],
        partial: { turn: 1, step: 1, blocks: { not: 'array' } as never },
      },
    }
    const screen = renderView({
      useProjection: () => null,
      useChat: ((select: (snapshot: ChatSnapshot) => unknown) => select(snapshot)) as PmWorkbenchViewProps['useChat'],
      pickFolder,
      openProject,
      saveCard: vi.fn(async () => null),
    })
    expect(screen.getByText(en['projects.empty'])).toBeTruthy()
    expect(screen.getByText(en['canvas.empty'])).toBeTruthy()
    expect(screen.getByText(/## Title/)).toBeTruthy()
    fireEvent.click(screen.getByText(en['projects.open']))
    await vi.waitFor(() => {
      expect(screen.getByText('denied')).toBeTruthy()
    })
    fireEvent.click(screen.getByText(en['projects.open']))
    await vi.waitFor(() => {
      expect(screen.getByText('blocked')).toBeTruthy()
    })
    fireEvent.click(screen.getByText(en['projects.open']))
    await vi.waitFor(() => {
      expect(pickFolder).toHaveBeenCalledTimes(3)
    })
    expect(openProject).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText(en['projects.open']))
    await vi.waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('/abs/alpha')
    })
    fireEvent.pointerDown(screen.getByLabelText(en['canvas.title']).firstElementChild as HTMLElement, { button: 1 })
  })

  it('shows the empty conversation copy when nothing has streamed', () => {
    const screen = renderView({
      useProjection: () => ({
        projectId: 'empty',
        folder: '/abs/empty',
        folders: { empty: '/abs/empty' },
        projects: ['empty'],
        cards: [],
      }),
      useChat: ((select: (snapshot: ChatSnapshot) => unknown) => select(EMPTY_CHAT_SNAPSHOT)) as PmWorkbenchViewProps['useChat'],
      pickFolder: vi.fn(async () => null),
      openProject: vi.fn(async () => null),
      saveCard: vi.fn(async () => null),
    })
    expect(screen.getByText(en['chat.empty'])).toBeTruthy()
    expect(screen.getByText(en['canvas.empty'])).toBeTruthy()
  })
})
