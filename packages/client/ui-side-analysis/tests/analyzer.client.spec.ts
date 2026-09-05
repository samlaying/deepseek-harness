import { describe, it, expect } from 'vitest'
import {
  estimateTokens,
  inferIntent,
  calculateSatisfaction,
  extractSignals,
  inferPreferences,
  buildAnalysisRecord,
  DEFAULT_PREFERENCES,
} from '../src/client/analyzer.ts'

describe('analyzer', () => {
  describe('estimateTokens', () => {
    it('returns 0 for empty text', () => {
      expect(estimateTokens('')).toBe(0)
    })

    it('estimates tokens for English text', () => {
      const text = 'Hello world, this is a test prompt for token estimation.'
      expect(estimateTokens(text)).toBeGreaterThan(5)
    })

    it('estimates tokens for Chinese text', () => {
      const text = '这是一段用于测试Token估算的中文文本。'
      expect(estimateTokens(text)).toBeGreaterThan(10)
    })
  })

  describe('inferIntent', () => {
    it('infers code debugging', () => {
      expect(inferIntent('这段代码报错了 TypeError: cannot read property of undefined')).toBe('代码调试')
      expect(inferIntent('帮我 fix 这个 bug')).toBe('代码调试')
    })

    it('infers concept explanation', () => {
      expect(inferIntent('什么是 React Fiber 原理？')).toBe('概念解释')
      expect(inferIntent('explain how cordis works')).toBe('概念解释')
    })

    it('infers creative writing', () => {
      expect(inferIntent('帮我写一篇关于人工智能发展的作文')).toBe('创意写作')
    })

    it('infers config query', () => {
      expect(inferIntent('这个 yaml 配置参数怎么设置？')).toBe('配置查询')
    })

    it('infers problem investigation', () => {
      expect(inferIntent('为什么这个请求会超时？帮我分析原因')).toBe('问题排查')
    })

    it('infers architecture design', () => {
      expect(inferIntent('如何设计一个微前端架构方案？')).toBe('架构设计')
    })

    it('infers implementation guide', () => {
      expect(inferIntent('怎么写一个二叉树遍历算法？')).toBe('实现指引')
    })

    it('falls back to general Q&A', () => {
      expect(inferIntent('今天北京天气')).toBe('通用问答')
    })
  })

  describe('calculateSatisfaction & extractSignals', () => {
    it('calculates default score 3 for empty signals', () => {
      expect(calculateSatisfaction([])).toBe(3)
    })

    it('calculates weighted score for positive signals', () => {
      const signals = extractSignals('太感谢了，完美解决了！')
      expect(signals).toContain('explicit_positive')
      expect(calculateSatisfaction(signals)).toBe(5)
    })

    it('calculates weighted score for negative signals', () => {
      const signals = extractSignals('不对，运行报错了')
      expect(signals).toContain('explicit_negative')
      expect(calculateSatisfaction(signals)).toBe(1)
    })

    it('calculates score with multiple actions', () => {
      const signals = extractSignals('继续解释一下', { copied: true, bookmarked: true })
      expect(signals).toContain('copied_response')
      expect(signals).toContain('bookmarked')
      expect(signals).toContain('continued_topic')
      const score = calculateSatisfaction(signals)
      expect(score).toBeGreaterThanOrEqual(3)
    })
  })

  describe('inferPreferences', () => {
    it('returns default preferences on empty history', () => {
      const pref = inferPreferences([])
      expect(pref).toEqual(DEFAULT_PREFERENCES)
    })

    it('infers response length, depth and tone from history', () => {
      const history = [
        { query: '请问如何实现 async await 的 Promise 调度机制？', response: '```ts\nclass Scheduler {}\n```\n这里是详细的解释：首先我们需要定义任务队列...', tokenCount: 400 },
        { query: '请问在 fiber 树中 pointer 怎么更新？给我完整代码', response: '```ts\nfunction updateFiber() {}\n```', tokenCount: 500 },
        { query: '感谢您，麻烦再讲解一下 AST 解析', response: '```ts\nconst ast = parse();\n```', tokenCount: 300 },
      ]
      const pref = inferPreferences(history)
      expect(pref.language).toBe('中文')
      expect(pref.responseLength).toBe('moderate')
      expect(pref.codePreference).toBe('file_blocks')
      expect(pref.technicalDepth).toBe('expert')
      expect(pref.tonePreference).toBe('formal')
    })
  })

  describe('buildAnalysisRecord', () => {
    it('creates an AnalysisRecord with valid defaults', () => {
      const record = buildAnalysisRecord({
        sessionId: 'sess_1',
        turnIndex: 1,
        userQuery: '怎么写快速排序？',
        assistantResponse: 'function quickSort(arr) { ... }',
      })
      expect(record.sessionId).toBe('sess_1')
      expect(record.turnIndex).toBe(1)
      expect(record.inferredIntent).toBe('实现指引')
      expect(record.inferredSatisfaction).toBe(3)
      expect(record.userRating).toBeNull()
      expect(record.userAccuracyVerdict).toBeNull()
      expect(record.userNote).toBeNull()
    })
  })
})
