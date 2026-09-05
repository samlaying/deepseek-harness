import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveRecord,
  getRecords,
  updateRecordVerification,
  savePreferences,
  getPreferences,
  clearSessionData,
} from '../src/client/storage.ts'
import type { AnalysisRecord } from '../src/client/types.ts'
import { DEFAULT_PREFERENCES } from '../src/client/analyzer.ts'

describe('storage', () => {
  const testSessionId = 'test_session_storage'

  beforeEach(async () => {
    await clearSessionData(testSessionId)
  })

  it('saves and retrieves records', async () => {
    const record: AnalysisRecord = {
      id: 'rec_1',
      sessionId: testSessionId,
      turnIndex: 1,
      timestamp: Date.now(),
      userQuery: '测试问题',
      assistantResponse: '测试回答',
      responseTokenCount: 10,
      latencyMs: 500,
      inferredIntent: '通用问答',
      inferredSatisfaction: 4,
      satisfactionSignals: ['copied_response'],
      userPreferences: DEFAULT_PREFERENCES,
      userRating: null,
      userAccuracyVerdict: null,
      userNote: null,
    }

    await saveRecord(record)
    const records = getRecords(testSessionId)
    expect(records.length).toBe(1)
    expect(records[0]?.id).toBe('rec_1')
    expect(records[0]?.userQuery).toBe('测试问题')
  })

  it('updates verification fields on a record', async () => {
    const record: AnalysisRecord = {
      id: 'rec_2',
      sessionId: testSessionId,
      turnIndex: 1,
      timestamp: Date.now(),
      userQuery: '测试问题2',
      assistantResponse: '测试回答2',
      responseTokenCount: 15,
      latencyMs: 600,
      inferredIntent: '代码调试',
      inferredSatisfaction: 2,
      satisfactionSignals: ['rephrase_requested'],
      userPreferences: DEFAULT_PREFERENCES,
      userRating: null,
      userAccuracyVerdict: null,
      userNote: null,
    }

    await saveRecord(record)
    await updateRecordVerification(testSessionId, 'rec_2', {
      userRating: 5,
      userAccuracyVerdict: 'accurate',
      userNote: '推断很准',
    })

    const records = getRecords(testSessionId)
    expect(records[0]?.userRating).toBe(5)
    expect(records[0]?.userAccuracyVerdict).toBe('accurate')
    expect(records[0]?.userNote).toBe('推断很准')
  })

  it('saves and retrieves preferences', async () => {
    const pref = {
      ...DEFAULT_PREFERENCES,
      language: 'English',
      technicalDepth: 'expert' as const,
    }
    await savePreferences(testSessionId, pref)
    const loaded = getPreferences(testSessionId)
    expect(loaded?.language).toBe('English')
    expect(loaded?.technicalDepth).toBe('expert')
  })
})
