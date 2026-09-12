/** Trajectory view: compact summary over a turn-aware event ledger + PM Workbench switch. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  AssistantBlock, ConversationSnapshot,
  SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  TrajectoryTable,
  type TrajectoryRequestNumber,
} from './TrajectoryTable.tsx'
import { TrajectoryToolbar } from './TrajectoryToolbar.tsx'
import { TrajectoryTimeline } from './TrajectoryTimeline.tsx'
import {
  appendTrajectoryPartialLayout, deriveTrajectoryLayout,
} from './layout.ts'
import {
  trajectoryTimelineFocusIndexes,
  type TrajectoryTimelineMode,
  type TrajectoryTimeRange,
} from './timeline.ts'
import { trajectoryRecordId } from './trajectory-record.ts'
import { TrajectorySearchIndex } from './trajectory-search-index.ts'
import { EMPTY_TRAJECTORY_SNAPSHOT } from './trajectory-snapshot-builder.ts'
import { PmWorkbenchView } from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './views.module.css'

const EMPTY_TURN_IDS: ReadonlySet<number> = new Set()
const EMPTY_RECORD_IDS: ReadonlySet<string> = new Set()
const SEARCH_INDEX_THROTTLE_MS = 3_000



function timelineBlock(block: AssistantBlock): AssistantBlock {
  switch (block.kind) {
    case 'text': return { kind: 'text', text: '' }
    case 'reasoning': return { kind: 'reasoning', text: '' }
    case 'image': return block
    case 'tool-call': return {
      kind: 'tool-call',
      callId: block.callId,
      name: block.name,
      argsRaw: '',
    }
    case 'other': return { kind: 'other', block: null }
  }
}

function partialStructureSignature(partial: ConversationSnapshot['partial']): string {
  if (partial === null) return ''
  return partial.blocks.map(block => block.kind === 'tool-call'
    ? `${block.kind}:${block.callId}:${block.name}`
    : block.kind).join('\u0000')
}

/** Session-bound controls not already supplied by the conversation view slot. */
export interface TrajectoryViewInjected {
  hooks: {
    duration: SnapshotStore<boolean>
  }
  loadOlder: () => Promise<boolean>
  setActualDuration: (actualDuration: boolean) => void
}


export function TrajectoryView({
  useSession, useDuration, loadOlder, setActualDuration,
  inspect, onInspectDone, t,
}: ConvViewProps & InjectFace<TrajectoryViewInjected> & PropsLocale<'trajectory'>) {
  const [collapsedTurns, setCollapsedTurns] = useState<ReadonlySet<number>>(EMPTY_TURN_IDS)
  const [collapsedAssistants, setCollapsedAssistants] =
    useState<ReadonlySet<string>>(EMPTY_RECORD_IDS)
  const [timelineSelection, setTimelineSelection] = useState<TrajectoryTimeRange | null>(null)
  const actualDuration = useDuration(value => value)
  const [actualTime, setActualTime] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex] = useState(() => new TrajectorySearchIndex())
  const [searchIndexRevision, setSearchIndexRevision] = useState(0)
  const searchIndexTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchIndexInitialized = useRef(false)
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number | null>(null)
  const [timelineRecordSelection, setTimelineRecordSelection] = useState<{
    readonly index: number
  } | null>(null)
  const [timelineRecordFocus, setTimelineRecordFocus] = useState<{
    readonly index: number
  } | null>(null)
  const [historyLoading] = useState(false)
  const [showPmWorkbench, setShowPmWorkbench] = useState(false)

  const sessionId = useSession(s => s.sessionId)
  const snapshot = useSession(s => s.views.get('trajectory') ?? EMPTY_TRAJECTORY_SNAPSHOT)
  const partial = useSession(s => s.partial)
  const historyBaseSeq = useSession(s => s.historyBaseSeq)
  const hasOlderHistory = useSession(s => s.hasOlderHistory)
  const olderHistoryLoading = useSession(s => s.historyLoading)

  const layout = useMemo(() => deriveTrajectoryLayout(snapshot), [snapshot])

  const partialSignature = useMemo(() => partialStructureSignature(partial), [partial])
  const partialTimelineBlock = useMemo(() => {
    if (partial === null) return null
    return partial.blocks.map(timelineBlock)
  }, [partialSignature])

  const turns = useMemo(() => {
    if (partialTimelineBlock === null) return layout.turns
    return appendTrajectoryPartialLayout(layout.turns, partialTimelineBlock)
  }, [layout.turns, partialTimelineBlock])

  const streamingCells = useMemo(() => {
    if (partial === null) return null
    return partial.blocks.filter(block => block.kind === 'text' || block.kind === 'reasoning')
  }, [partial])

  const requestNumbers = useMemo(() => {
    const numbers = new Map<number, TrajectoryRequestNumber>()
    let currentNumber = 1
    for (const turn of turns) {
      for (const group of turn.groups) {
        if (group.kind === 'assistant') {
          numbers.set(group.node.seq, currentNumber++)
        }
      }
    }
    return numbers
  }, [turns])

  const timelineMode: TrajectoryTimelineMode = actualTime
    ? 'actual-time'
    : actualDuration ? 'actual-duration' : 'equal-width'

  const timelineRange = useMemo(() => {
    if (timelineSelection === null) return null
    return timelineSelection
  }, [timelineSelection])

  const timelineTurns = turns

  const timelineFocusIndexes = useMemo(() => {
    if (timelineRange === null) return null
    return trajectoryTimelineFocusIndexes(timelineTurns, timelineRange)
  }, [timelineTurns, timelineRange])

  useEffect(() => {
    if (searchIndexInitialized.current) return
    searchIndexInitialized.current = true
    searchIndex.populate(turns)
    setSearchIndexRevision(r => r + 1)
  }, [turns, searchIndex])

  useEffect(() => {
    if (!searchIndexInitialized.current) return
    if (searchIndexTimer.current !== null) clearTimeout(searchIndexTimer.current)
    searchIndexTimer.current = setTimeout(() => {
      searchIndex.populate(turns)
      setSearchIndexRevision(r => r + 1)
    }, SEARCH_INDEX_THROTTLE_MS)
    return () => {
      if (searchIndexTimer.current !== null) clearTimeout(searchIndexTimer.current)
    }
  }, [turns, searchIndex])

  const searchMatchIndexes = useMemo(() => {
    if (searchQuery === '') return null
    return searchIndex.search(searchQuery)
  }, [searchQuery, searchIndex, searchIndexRevision])

  const handleTimelineRangeChange = useCallback((range: TrajectoryTimeRange | null) => {
    setTimelineSelection(range)
  }, [])

  const handleTimelineRecordSelect = useCallback((index: number | null) => {
    setSelectedTimelineIndex(index)
    setTimelineRecordSelection(index === null ? null : { index })
  }, [])

  const handleTimelineRecordFocus = useCallback((index: number | null) => {
    setTimelineRecordFocus(index === null ? null : { index })
  }, [])

  const handleRecordSelect = useCallback((index: number) => {
    setSelectedTimelineIndex(index)
    setTimelineRecordSelection({ index })
  }, [])

  const collapsibleAssistantIds = useMemo(() => {
    const ids: string[] = []
    for (const turn of turns) {
      for (const group of turn.groups) {
        if (group.kind === 'assistant' && group.cells.length > 0) {
          ids.push(trajectoryRecordId(group.node))
        }
      }
    }
    return ids
  }, [turns])

  const allAssistantsCollapsed = collapsibleAssistantIds.length > 0
    && collapsibleAssistantIds.every(id => collapsedAssistants.has(id))

  const allTurnsCollapsed = turns.length > 0
    && turns.every(turn => collapsedTurns.has(turn.turnId))

  const toggleTurn = (turnId: number) => {
    setCollapsedTurns((current) => {
      const collapsed = new Set(current)
      if (collapsed.has(turnId)) collapsed.delete(turnId)
      else collapsed.add(turnId)
      return collapsed
    })
  }

  const toggleAssistant = (recordId: string) => {
    setCollapsedAssistants((current) => {
      const collapsed = new Set(current)
      if (collapsed.has(recordId)) collapsed.delete(recordId)
      else collapsed.add(recordId)
      return collapsed
    })
  }

  const toggleAllTurns = () => {
    setCollapsedTurns((current) => {
      const collapsed = new Set(current)
      if (allTurnsCollapsed) {
        for (const turn of turns) collapsed.delete(turn.turnId)
      } else {
        for (const turn of turns) collapsed.add(turn.turnId)
      }
      return collapsed
    })
  }

  const toggleAllAssistants = () => {
    setCollapsedAssistants((current) => {
      const collapsed = new Set(current)
      if (allAssistantsCollapsed) {
        for (const index of collapsibleAssistantIds) collapsed.delete(index)
      } else {
        for (const index of collapsibleAssistantIds) collapsed.add(index)
      }
      return collapsed
    })
  }

  const loadEarlierHistory = useCallback(() => {
    return loadOlder()
  }, [loadOlder])

  return (
    <div className={css.root} data-conversation-composer-overlay="">
      <TrajectoryToolbar
        actualDuration={actualDuration}
        onActualDurationChange={(nextActualDuration) => {
          setActualDuration(nextActualDuration)
          setTimelineSelection(null)
        }}
        actualTime={actualTime}
        onActualTimeChange={(nextActualTime) => {
          setActualTime(nextActualTime)
          setTimelineSelection(null)
        }}
        allTurnsCollapsed={allTurnsCollapsed}
        onToggleAllTurns={toggleAllTurns}
        allAssistantsCollapsed={allAssistantsCollapsed}
        onToggleAllAssistants={toggleAllAssistants}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        t={t}
        onTogglePmWorkbench={() => { setShowPmWorkbench(!showPmWorkbench) }}
      />
      {showPmWorkbench ? (
        <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
          <PmWorkbenchView sessionId={sessionId} />
        </div>
      ) : (
        <>
          <TrajectoryTimeline
            turns={timelineTurns}
            mode={timelineMode}
            range={timelineRange}
            hasEarlierRecords={hasOlderHistory}
            onLoadEarlier={loadEarlierHistory}
            selectedIndex={selectedTimelineIndex}
            searchMatchIndexes={searchMatchIndexes}
            onRangeChange={handleTimelineRangeChange}
            onRecordSelect={handleTimelineRecordSelect}
            onRecordFocus={handleTimelineRecordFocus}
          />
          <div className={css.ledger}>
            <TrajectoryTable
              requestNumbers={requestNumbers}
              turns={timelineTurns}
              streamingCells={streamingCells}
              timelineFocusIndexes={timelineFocusIndexes}
              searchMatchIndexes={searchMatchIndexes}
              onSelectedIndexChange={setSelectedTimelineIndex}
              onRecordSelect={handleRecordSelect}
              recordSelection={timelineRecordSelection}
              recordFocus={timelineRecordFocus}
              historyLoading={historyLoading}
              olderHistoryLoading={olderHistoryLoading}
              historyStartSeq={historyBaseSeq}
              hasOlderRecords={hasOlderHistory}
              onLoadOlder={loadEarlierHistory}
              onClearSelection={() => { setTimelineSelection(null) }}
              collapsedTurns={collapsedTurns}
              onToggleTurn={toggleTurn}
              collapsedAssistants={collapsedAssistants}
              onToggleAssistant={toggleAssistant}
              inspectCallId={inspect?.callId ?? null}
              onInspectApplied={onInspectDone}
            />
          </div>
        </>
      )}
    </div>
  )
}
