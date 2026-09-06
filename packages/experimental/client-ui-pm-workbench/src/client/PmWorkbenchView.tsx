/** PM Workbench conversation view: project list, live chat, shared markdown canvas. */

import {
  createElement as h, useEffect, useMemo, useRef, useState,
  type ChangeEvent, type PointerEvent, type ReactNode,
} from 'react'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PmBoardSnapshot, PmCard, PmCardKind } from '@deepseek-ai/dsh-experimental-pm-workbench/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { PmWorkbenchKey } from './locales.ts'
import css from './PmWorkbenchView.module.css'

/** Injected mutations that persist through Host slash commands. */
export interface PmWorkbenchInjected {
  /**
   * Open the OS folder picker (Finder on macOS).
   * @returns the absolute folder, or null when the operator cancels.
   */
  pickFolder: () => Promise<string | null>
  /**
   * Bind a folder or reopen an already-bound project id.
   * @param target - absolute folder or bound project id.
   * @returns null on success, otherwise a failure line.
   */
  openProject: (target: string) => Promise<string | null>
  /**
   * Write one card to local markdown and notify the agent.
   * @param card - card fields to persist.
   * @returns null on success, otherwise a failure line.
   */
  saveCard: (card: Pick<PmCard, 'id' | 'kind' | 'title' | 'markdown' | 'x' | 'y' | 'width' | 'height'> & {
    readonly projectId: string
  }) => Promise<string | null>
}

/** Full props of the PM Workbench view. */
export type PmWorkbenchViewProps = ConvViewProps & PropsLocale<'pm-workbench'> & PmWorkbenchInjected

const KIND_KEY: Record<PmCardKind, PmWorkbenchKey> = {
  thought: 'kind.thought',
  template: 'kind.template',
  doc: 'kind.doc',
  memory: 'kind.memory',
}

function blocksText(blocks: ChatSnapshot['legacy']['partial'] extends infer T
  ? T extends { blocks: infer B } ? B : never
  : never): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((block): block is { kind: 'text'; text: string } => {
      return typeof block === 'object' && block !== null && (block as { kind?: string }).kind === 'text'
    })
    .map(block => block.text)
    .join('')
}

function previewMarkdown(markdown: string): ReactNode[] {
  return markdown.split('\n').map((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) return h('h1', { key: index }, trimmed.slice(2))
    if (trimmed.startsWith('## ')) return h('h2', { key: index }, trimmed.slice(3))
    if (trimmed.startsWith('### ')) return h('h3', { key: index }, trimmed.slice(4))
    if (trimmed === '') return h('p', { key: index }, ' ')
    return h('p', { key: index }, line)
  })
}

function CardPanel({
  card, t, onSave,
}: {
  card: PmCard
  t: PmWorkbenchViewProps['t']
  onSave: (markdown: string) => void
}) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [draft, setDraft] = useState(card.markdown)
  useEffect(() => {
    if (mode === 'preview') setDraft(card.markdown)
  }, [card.markdown, mode])
  return h('section', {
    className: `${css.panel} ${css[card.kind]}`,
    style: { left: card.x, top: card.y, width: card.width, height: card.height },
  },
  h('div', { className: css.bar },
    h('div', null,
      h('div', { className: css.title }, card.title),
      h('div', { className: css.kind }, t(KIND_KEY[card.kind])),
    ),
    h('div', { className: css.actions },
      h('button', {
        type: 'button',
        onClick: () => setMode(mode === 'preview' ? 'edit' : 'preview'),
      }, t(mode === 'preview' ? 'card.edit' : 'card.preview')),
      h('button', {
        type: 'button',
        onClick: () => onSave(draft),
      }, t('card.save')),
    ),
  ),
  h('div', { className: css.body },
    mode === 'edit'
      ? h('textarea', {
        className: css.editor,
        value: draft,
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) => setDraft(event.currentTarget.value),
      })
      : previewMarkdown(card.markdown),
  ),
  )
}

/**
 * Render the PM Workbench conversation view.
 * @param props - conversation view props, locale, and board mutations.
 * @returns the project list, live conversation column, and infinite canvas.
 */
export function PmWorkbenchView(props: PmWorkbenchViewProps) {
  const { t, pickFolder, openProject, saveCard, useProjection, useChat } = props
  const board = useProjection('pmWorkbench') as PmBoardSnapshot | null | undefined
  const live = useChat((snapshot: ChatSnapshot) => snapshot.legacy.partial)
  const nodes = useChat((snapshot: ChatSnapshot) => snapshot.legacy.nodes)
  const [error, setError] = useState<string | null>(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [pan, setPan] = useState({ x: 120, y: 80 })
  const drag = useRef<{ pointer: number; x: number; y: number; panX: number; panY: number } | null>(null)
  const liveText = useMemo(() => (live === null ? '' : blocksText(live.blocks)), [live])

  const bind = async () => {
    let folder: string | null
    try {
      folder = await pickFolder()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
      return
    }
    if (folder === null) return
    setError(await openProject(folder))
  }

  const open = async (projectId: string) => {
    setError(await openProject(projectId))
  }

  const projects = board?.projects ?? []
  const folders = board?.folders ?? {}

  return h('div', {
    className: `${css.root} ${leftCollapsed ? css.leftCollapsed : ''}`,
    'data-conversation-composer-overlay': '',
  },
  h('aside', { className: css.left, 'aria-label': t('projects.title') },
    h('div', { className: css.leftHeader },
      leftCollapsed ? null : h('h2', { className: css.heading }, t('projects.title')),
      h('button', {
        type: 'button',
        className: css.toggleButton,
        onClick: () => setLeftCollapsed(!leftCollapsed),
        title: leftCollapsed ? t('projects.expand') : t('projects.toggle'),
        'aria-label': leftCollapsed ? t('projects.expand') : t('projects.toggle'),
      }, leftCollapsed ? '›' : '‹'),
    ),
    leftCollapsed ? null : h('div', { className: css.row },
      h('button', { type: 'button', onClick: () => void bind() }, t('projects.open')),
    ),
    leftCollapsed ? null : (error === null ? null : h('p', { className: css.hint }, error)),
    leftCollapsed ? null : (projects.length === 0
      ? h('p', { className: css.empty }, t('projects.empty'))
      : h('div', { className: css.list },
        projects.map(projectId => h('button', {
          key: projectId,
          type: 'button',
          className: projectId === board?.projectId ? css.active : css.project,
          onClick: () => void open(projectId),
        }, folders[projectId] ?? projectId)),
      )),
  ),
  h('section', { className: css.mid, 'aria-label': t('chat.title') },
    h('h2', { className: css.heading }, t('chat.title')),
    h('div', { className: css.stream },
      nodes.length === 0 && liveText === ''
        ? h('p', { className: css.empty }, t('chat.empty'))
        : null,
      nodes.map((node, index) => {
        if (node.kind === 'user') {
          const blocks = node.content
            .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
            .map(block => block.text)
          // Deduplicate consecutive identical blocks
          const deduplicated = blocks.filter((text, i) => i === 0 || text !== blocks[i - 1])
          let text = deduplicated.join('\n')
          // Truncate pathologically long text to first sentence
          if (text.length > 500) {
            const firstSentence = text.match(/^[^。！？.!?]+[。！？.!?]/)
            if (firstSentence) {
              text = firstSentence[0]
            } else {
              text = text.substring(0, 200) + '...'
            }
          }
          if (text === '') return null
          return h('p', { key: `u-${index}`, className: `${css.bubble} ${css.user}` }, text)
        }
        if (node.kind === 'assistant') {
          const text = blocksText(node.blocks)
          if (text === '') return null
          return h('p', { key: `a-${index}`, className: `${css.bubble} ${css.assistant}` }, text)
        }
        return null
      }),
      liveText === '' ? null : h('p', { className: `${css.bubble} ${css.assistant}` }, liveText),
    ),
  ),
  h('aside', { className: css.right, 'aria-label': t('canvas.title') },
    h('div', {
      className: css.canvas,
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return
        const target = event.target
        if (!(target instanceof Element) || target.closest('button, textarea, input, section')) return
        drag.current = {
          pointer: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          panX: pan.x,
          panY: pan.y,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        const start = drag.current
        if (start === null || start.pointer !== event.pointerId) return
        setPan({
          x: start.panX + event.clientX - start.x,
          y: start.panY + event.clientY - start.y,
        })
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
        if (drag.current?.pointer === event.pointerId) drag.current = null
      },
    },
    h('div', { className: css.surface, style: { transform: `translate(${pan.x}px, ${pan.y}px)` } },
      board == null || (board.cards.length === 0 && liveText === '')
        ? h('p', { className: css.empty, style: { position: 'absolute', left: 48, top: 44 } }, t('canvas.empty'))
        : null,
      liveText === '' || board == null ? null : h('section', {
        className: `${css.panel} ${css.live}`,
        style: { left: 980, top: 44, width: 440, height: 280 },
      },
      h('div', { className: css.bar }, h('div', null, t('canvas.live'))),
      h('div', { className: css.body }, previewMarkdown(liveText)),
      ),
      board == null ? null : board.cards.map(card => h(CardPanel, {
        key: card.id,
        card,
        t,
        onSave: (markdown) => {
          void saveCard({ ...card, projectId: board.projectId, markdown }).then(setError)
        },
      })),
    ),
    ),
  ),
  )
}
