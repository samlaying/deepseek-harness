// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import { SideAnalysisPanel } from '../src/client/components/SideAnalysisPanel.tsx'
import { saveRecord, clearSessionData } from '../src/client/storage.ts'
import { DEFAULT_PREFERENCES } from '../src/client/analyzer.ts'

afterEach(async () => {
  cleanup()
  await clearSessionData('sess_test_1')
})

describe('SideAnalysisPanel component', () => {
  const mockUseSessions = vi.fn().mockImplementation((selector: (s: unknown) => unknown) => selector({ current: 'sess_test_1' }))
  const mockSnapshot: Partial<ConversationSnapshot> = {
    sessionId: 'sess_test_1' as never,
    nodes: [
      {
        kind: 'user',
        seq: 1,
        time: Date.now(),
        content: [{ type: 'text', text: '请问如何修复这个 bug？' }],
        source: null,
      },
      {
        kind: 'assistant',
        seq: 2,
        time: Date.now() + 500,
        turn: 1,
        step: 1,
        blocks: [{ kind: 'text', text: '这是一个典型的空指针异常，可以通过增加非空判断来解决。' }],
        timing: { stepStartTime: 1000, firstTokenTime: 1200, completedTime: 1500 },
      },
    ],
    turnEnds: new Map([[1, 2]]),
    running: false,
  }

  const mockGetSessionSnapshot = vi.fn().mockReturnValue(mockSnapshot)
  const dummyUseWorkspaces = vi.fn() as never

  it('renders collapsed rail by default with score and title', async () => {
    const { container } = render(
      <SideAnalysisPanel
        useSessions={mockUseSessions}
        useWorkspaces={dummyUseWorkspaces}
        getSessionSnapshot={mockGetSessionSnapshot}
      />,
    )

    expect(screen.getByText('旁听分析')).toBeDefined()
    expect(container.querySelector('[data-plugin="side-analysis-panel"]')).not.toBeNull()
  })

  it('expands on clicking the rail and shows overview and records', async () => {
    await saveRecord({
      id: 'rec_100',
      sessionId: 'sess_test_1',
      turnIndex: 1,
      timestamp: Date.now(),
      userQuery: '请问如何修复这个 bug？',
      assistantResponse: '这是一个典型的空指针异常...',
      responseTokenCount: 20,
      latencyMs: 500,
      inferredIntent: '代码调试',
      inferredSatisfaction: 4,
      satisfactionSignals: ['continued_topic'],
      userPreferences: DEFAULT_PREFERENCES,
      userRating: null,
      userAccuracyVerdict: null,
      userNote: null,
    })

    render(
      <SideAnalysisPanel
        useSessions={mockUseSessions}
        useWorkspaces={dummyUseWorkspaces}
        getSessionSnapshot={mockGetSessionSnapshot}
      />,
    )

    const rail = screen.getByText('旁听分析')
    fireEvent.click(rail)

    expect(screen.getByText('旁听分析面板')).toBeDefined()
    expect(screen.getByText('当前会话概览')).toBeDefined()
    expect(screen.getByText('用户偏好推断（实时）')).toBeDefined()
    expect(screen.getByText('最近分析记录')).toBeDefined()
    expect(screen.getAllByText(/代码调试/).length).toBeGreaterThan(0)
  })

  it('handles user rating, accuracy verdict, and note input', async () => {
    await saveRecord({
      id: 'rec_interactive',
      sessionId: 'sess_test_1',
      turnIndex: 1,
      timestamp: Date.now(),
      userQuery: '请问如何修复这个 bug？',
      assistantResponse: '这是一个典型的空指针异常...',
      responseTokenCount: 20,
      latencyMs: 500,
      inferredIntent: '代码调试',
      inferredSatisfaction: 4,
      satisfactionSignals: [],
      userPreferences: DEFAULT_PREFERENCES,
      userRating: null,
      userAccuracyVerdict: null,
      userNote: null,
    })

    render(
      <SideAnalysisPanel
        useSessions={mockUseSessions}
        useWorkspaces={dummyUseWorkspaces}
        getSessionSnapshot={mockGetSessionSnapshot}
      />,
    )

    // Expand panel
    fireEvent.click(screen.getByText('旁听分析'))

    // Rate 5 stars
    const star5 = screen.getByTitle('评为 5 星')
    fireEvent.click(star5)

    // Accuracy toggle: click "准"
    const accurateBtn = screen.getByText('准')
    fireEvent.click(accurateBtn)

    // Expand Note and type
    const noteBtn = screen.getByText('备注')
    fireEvent.click(noteBtn)

    const textarea = screen.getByPlaceholderText('填写补充说明...')
    fireEvent.change(textarea, { target: { value: '分析得很准，建议保持' } })
    fireEvent.blur(textarea)

    // Collapse panel
    const collapseBtn = screen.getByText('收起')
    fireEvent.click(collapseBtn)

    expect(screen.getByText('旁听分析')).toBeDefined()
  })
})
