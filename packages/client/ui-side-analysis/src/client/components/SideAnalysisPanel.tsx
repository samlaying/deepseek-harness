/**
 * Side analysis panel presentation component.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { ConversationSnapshot, ConversationNode, AssistantMessageNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { AnalysisRecord, PreferenceSnapshot } from '../types.ts'
import { getRecords, getPreferences, updateRecordVerification, saveRecord, savePreferences } from '../storage.ts'
import { buildAnalysisRecord, inferPreferences, DEFAULT_PREFERENCES } from '../analyzer.ts'
import css from './SideAnalysisPanel.module.css'

export interface SideAnalysisPanelInjected {
  getSessionSnapshot?: (sessionId: string) => ConversationSnapshot | undefined
}

export type SideAnalysisPanelProps = PropsRuntime<'shell.overlay'> & SideAnalysisPanelInjected

export function SideAnalysisPanel({ useSessions, getSessionSnapshot }: SideAnalysisPanelProps): React.ReactElement | null {
  const currentSessionId = useSessions(s => (s as { current?: string | null })?.current ?? null)

  const [expanded, setExpanded] = useState<boolean>(false)
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [preferences, setPreferences] = useState<PreferenceSnapshot>(DEFAULT_PREFERENCES)
  const [visibleLimit, setVisibleLimit] = useState<number>(10)
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})

  // Load existing records from storage when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setRecords([])
      setPreferences(DEFAULT_PREFERENCES)
      return
    }
    const initialRecords = getRecords(currentSessionId)
    setRecords(initialRecords)
    const initialPrefs = getPreferences(currentSessionId)
    if (initialPrefs) {
      setPreferences(initialPrefs)
    }
  }, [currentSessionId])

  // Passive observation: check session snapshots
  useEffect(() => {
    if (!currentSessionId) return
    const session = getSessionSnapshot?.(currentSessionId)
    if (!session) return

    const nodes: readonly ConversationNode[] = session.nodes ?? []
    const completedTurnEnds = session.turnEnds

    const userNodes = nodes.filter(n => n.kind === 'user')
    const assistantNodes = nodes.filter((n): n is AssistantMessageNode => n.kind === 'assistant')

    let shouldSave = false
    const existing = getRecords(currentSessionId)
    const existingTurnMap = new Map<number, AnalysisRecord>(existing.map(r => [r.turnIndex, r]))
    const newRecords = [...existing]

    for (let i = 0; i < userNodes.length; i++) {
      const userNode = userNodes[i]!
      const turnIndex = i + 1
      const isTurnCompleted = completedTurnEnds?.has(turnIndex) || i < userNodes.length - 1 || (!session.running && i === userNodes.length - 1)

      if (!isTurnCompleted) continue

      const matchingAssistant = assistantNodes.filter(a => a.turn === turnIndex)
      const assistantText = matchingAssistant
        .flatMap(a => a.blocks)
        .filter(b => b.kind === 'text')
        .map(b => (b as { kind: 'text'; text: string }).text)
        .join('\n')

      const userText = userNode.content
        .filter(c => c.type === 'text')
        .map(c => (c as { type: 'text'; text: string }).text)
        .join('\n')

      if (!userText) continue

      const nextUserNode = userNodes[i + 1]
      const followUpText = nextUserNode?.content
        .filter(c => c.type === 'text')
        .map(c => (c as { type: 'text'; text: string }).text)
        .join('\n')

      const recordExists = existingTurnMap.get(turnIndex)
      if (!recordExists) {
        const record = buildAnalysisRecord({
          sessionId: currentSessionId,
          turnIndex,
          timestamp: userNode.time || Date.now(),
          userQuery: userText,
          assistantResponse: assistantText,
          latencyMs: matchingAssistant[0]?.timing?.completedTime && matchingAssistant[0]?.timing?.stepStartTime
            ? Math.max(50, matchingAssistant[0].timing.completedTime - matchingAssistant[0].timing.stepStartTime)
            : 800,
          followUpQuery: followUpText,
          userPreferences: preferences,
        })
        newRecords.push(record)
        void saveRecord(record)
        shouldSave = true
      }
    }

    if (shouldSave) {
      newRecords.sort((a, b) => a.turnIndex - b.turnIndex)
      setRecords(newRecords)

      const history = newRecords.map(r => ({ query: r.userQuery, response: r.assistantResponse, tokenCount: r.responseTokenCount }))
      const updatedPref = inferPreferences(history, preferences)
      setPreferences(updatedPref)
      void savePreferences(currentSessionId, updatedPref)
    }
  }, [currentSessionId, getSessionSnapshot, preferences])

  // Overview calculations
  const totalTurns = records.length
  const averageRating = useMemo(() => {
    if (records.length === 0) return null
    const ratings = records.map(r => r.userRating ?? r.inferredSatisfaction)
    const sum = ratings.reduce((a, b) => a + b, 0)
    return (sum / ratings.length).toFixed(1)
  }, [records])

  const dominantIntent = useMemo(() => {
    if (records.length === 0) return '暂无数据'
    const counts: Record<string, number> = {}
    for (const r of records) {
      counts[r.inferredIntent] = (counts[r.inferredIntent] ?? 0) + 1
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const top = sorted[0]
    if (!top) return '暂无数据'
    const percent = Math.round((top[1] / records.length) * 100)
    return `${top[0]} (${percent}%)`
  }, [records])

  const hasWarning = useMemo(() => {
    return records.some(r => r.inferredSatisfaction <= 2 && r.userRating === null)
  }, [records])

  // Handlers for user rating and verdict
  const handleSetRating = useCallback((recordId: string, rating: number) => {
    if (!currentSessionId) return
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, userRating: rating } : r))
    void updateRecordVerification(currentSessionId, recordId, { userRating: rating })
  }, [currentSessionId])

  const handleToggleVerdict = useCallback((recordId: string, verdict: 'accurate' | 'inaccurate') => {
    if (!currentSessionId) return
    setRecords(prev => prev.map((r) => {
      if (r.id !== recordId) return r
      const nextVerdict = r.userAccuracyVerdict === verdict ? null : verdict
      void updateRecordVerification(currentSessionId, recordId, { userAccuracyVerdict: nextVerdict })
      return { ...r, userAccuracyVerdict: nextVerdict }
    }))
  }, [currentSessionId])

  const handleSaveNote = useCallback((recordId: string, noteText: string) => {
    if (!currentSessionId) return
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, userNote: noteText } : r))
    void updateRecordVerification(currentSessionId, recordId, { userNote: noteText })
  }, [currentSessionId])

  if (!currentSessionId) {
    return null
  }

  return (
    <div
      data-plugin="side-analysis-panel"
      className={clsx(css.panelContainer, expanded ? css.expanded : css.collapsed)}
    >
      {!expanded ? (
        <div className={css.rail} onClick={() => { setExpanded(true) }} title="点击展开旁听分析面板">
          <div className={css.railIcon}>📊</div>
          {hasWarning && <div className={css.redDot} title="存在低满意度且未校验轮次" />}
          <div className={css.railScore}>
            <span className={css.railStar}>★</span>
            <span>{averageRating ?? '-'}</span>
          </div>
          <div className={css.railLabel}>旁听分析</div>
        </div>
      ) : (
        <>
          <div className={css.header}>
            <div className={css.titleArea}>
              <span>📊</span>
              <span>旁听分析面板</span>
            </div>
            <div className={css.actionsArea}>
              <button
                type="button"
                className={css.iconButton}
                onClick={() => { setExpanded(false) }}
              >
                收起
              </button>
            </div>
          </div>

          <div className={css.scrollBody}>
            {/* Overview Card */}
            <div className={css.card}>
              <div className={css.cardTitle}>当前会话概览</div>
              <div className={css.overviewGrid}>
                <div className={css.overviewItem}>
                  <span className={css.overviewLabel}>总轮次</span>
                  <span className={css.overviewValue}>{totalTurns} 轮</span>
                </div>
                <div className={css.overviewItem}>
                  <span className={css.overviewLabel}>平均评分</span>
                  <span className={css.overviewValue}>{averageRating ? `${averageRating} ★` : '暂无'}</span>
                </div>
              </div>
              <div className={css.overviewItem}>
                <span className={css.overviewLabel}>主要意图</span>
                <span className={css.overviewValue}>{dominantIntent}</span>
              </div>
              <div className={css.trendBarContainer}>
                <span className={css.overviewLabel}>满意度指数</span>
                <div className={css.trendBar}>
                  <div
                    className={css.trendBarFill}
                    style={{ width: `${Math.min(100, (Number(averageRating || 3) / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Preferences Card */}
            <div className={css.card}>
              <div className={css.cardTitle}>用户偏好推断（实时）</div>
              <div className={css.prefGrid}>
                <div className={css.prefItem}>
                  <span className={css.overviewLabel}>长度:</span>
                  <span className={css.prefTag}>
                    {preferences.responseLength === 'concise' ? '简明' : preferences.responseLength === 'moderate' ? '适中' : '详细'}
                  </span>
                </div>
                <div className={css.prefItem}>
                  <span className={css.overviewLabel}>深度:</span>
                  <span className={css.prefTag}>
                    {preferences.technicalDepth === 'beginner' ? '初级' : preferences.technicalDepth === 'intermediate' ? '中级' : '专家'}
                  </span>
                </div>
                <div className={css.prefItem}>
                  <span className={css.overviewLabel}>语言:</span>
                  <span className={css.prefTag}>{preferences.language}</span>
                </div>
                <div className={css.prefItem}>
                  <span className={css.overviewLabel}>代码:</span>
                  <span className={css.prefTag}>
                    {preferences.codePreference === 'file_blocks' ? '完整文件' : preferences.codePreference === 'inline' ? '行内代码' : '无代码'}
                  </span>
                </div>
                <div className={css.prefItem}>
                  <span className={css.overviewLabel}>语气:</span>
                  <span className={css.prefTag}>
                    {preferences.tonePreference === 'formal' ? '正式' : preferences.tonePreference === 'academic' ? '学术' : '随和'}
                  </span>
                </div>
              </div>

              {preferences.recurringTopics.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <span className={css.overviewLabel}>话题:</span>
                  <div className={css.topicChips}>
                    {preferences.recurringTopics.map(t => (
                      <span key={t} className={css.topicChip}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Analysis Records */}
            <div className={css.card}>
              <div className={css.cardTitle}>最近分析记录</div>
              {records.length === 0 ? (
                <div className={css.emptyState}>
                  <span>暂无 Q&A 分析记录</span>
                  <span style={{ fontSize: '11px' }}>在主对话区发送消息即可生成</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {records.slice(-visibleLimit).reverse().map(record => (
                    <div key={record.id} className={css.recordCard}>
                      <div className={css.recordHead}>
                        <span className={css.turnBadge}>#{record.turnIndex}</span>
                        <span className={css.recordQuery} title={record.userQuery}>
                          {record.userQuery}
                        </span>
                      </div>

                      <div className={css.recordMeta}>
                        <span className={css.intentBadge}>意图: {record.inferredIntent}</span>
                        <div className={css.stars} title={`推断满意度: ${record.inferredSatisfaction} 星`}>
                          {'★'.repeat(record.inferredSatisfaction) + '☆'.repeat(5 - record.inferredSatisfaction)}
                        </div>
                      </div>

                      {record.satisfactionSignals.length > 0 && (
                        <div className={css.signalsList}>
                          {record.satisfactionSignals.map(sig => (
                            <span key={sig} className={css.signalBadge}>{sig}</span>
                          ))}
                        </div>
                      )}

                      <div className={css.userFeedbackRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--dsw-alias-text-tertiary)' }}>评分:</span>
                          <div className={css.interactiveStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                className={clsx(css.starBtn, (record.userRating ?? 0) >= star && css.starBtnActive)}
                                onClick={() => { handleSetRating(record.id, star) }}
                                title={`评为 ${star} 星`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={css.verdictGroup}>
                          <button
                            type="button"
                            className={clsx(css.verdictBtn, record.userAccuracyVerdict === 'accurate' && css.verdictBtnActive)}
                            onClick={() => { handleToggleVerdict(record.id, 'accurate') }}
                          >
                            准
                          </button>
                          <button
                            type="button"
                            className={clsx(css.verdictBtn, record.userAccuracyVerdict === 'inaccurate' && css.verdictBtnActive)}
                            onClick={() => { handleToggleVerdict(record.id, 'inaccurate') }}
                          >
                            不准
                          </button>
                          <button
                            type="button"
                            className={css.noteToggleBtn}
                            onClick={() => {
                              setExpandedNoteId(expandedNoteId === record.id ? null : record.id)
                              if (!noteDrafts[record.id]) {
                                setNoteDrafts(prev => ({ ...prev, [record.id]: record.userNote ?? '' }))
                              }
                            }}
                          >
                            备注
                          </button>
                        </div>
                      </div>

                      {expandedNoteId === record.id && (
                        <div style={{ marginTop: '4px' }}>
                          <textarea
                            className={css.noteArea}
                            placeholder="填写补充说明..."
                            value={noteDrafts[record.id] ?? record.userNote ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setNoteDrafts(prev => ({ ...prev, [record.id]: val }))
                            }}
                            onBlur={(e) => {
                              handleSaveNote(record.id, e.target.value)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {records.length > visibleLimit && (
                    <button
                      type="button"
                      className={css.loadMoreBtn}
                      onClick={() => { setVisibleLimit(prev => prev + 10) }}
                    >
                      加载更多 ({records.length - visibleLimit} 条未显示)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
