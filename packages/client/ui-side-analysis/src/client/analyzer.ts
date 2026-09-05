/**
 * Analysis engine for conversation turns: intent inference, satisfaction rating, and preference profiling.
 */
import type { AnalysisRecord, PreferenceSnapshot, SatisfactionSignal } from './types.ts'

/** Rough token estimator for Chinese / English mixed text. */
export function estimateTokens(text: string): number {
  if (!text) return 0
  let chineseChars = 0
  let otherChars = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0x4e00 && code <= 0x9fa5) {
      chineseChars++
    } else {
      otherChars++
    }
  }
  return Math.max(1, Math.round(chineseChars * 1.2 + otherChars / 3.5))
}

/** Infer intent based on user query structure and keywords. */
export function inferIntent(query: string): string {
  const q = query.toLowerCase()
  if (/bug|报错|error|exception|debug|修复|fix|crash|trace|堆栈|段错误|fail|panic/.test(q)) {
    return '代码调试'
  }
  if (/什么是|what is|explain|解释|原理|如何理解|meaning|介绍一下|定义/.test(q)) {
    return '概念解释'
  }
  if (/写一篇|作文|故事|文案|poem|essay|story|草拟|编排|润色|创作/.test(q)) {
    return '创意写作'
  }
  if (/config|配置|yaml|json|options|参数|settings|环境变量|env/.test(q)) {
    return '配置查询'
  }
  if (/为什么|why|原因|排查|troubleshoot|investigate|分析原因/.test(q)) {
    return '问题排查'
  }
  if (/架构|设计|design|architecture|方案|pattern|模式|重构|refactor/.test(q)) {
    return '架构设计'
  }
  if (/优化|perf|performance|加速|瓶颈|memory leak|内存/.test(q)) {
    return '性能优化'
  }
  if (/怎么|如何|how to|步骤|方法|实现|写一个|写段/.test(q)) {
    return '实现指引'
  }
  return '通用问答'
}

/** Satisfaction signals weight map. */
const SIGNAL_WEIGHTS: Record<SatisfactionSignal, { score: number; weight: number }> = {
  explicit_positive: { score: 5, weight: 3.0 },
  explicit_negative: { score: 1, weight: 3.0 },
  rephrase_requested: { score: 2, weight: 1.0 },
  edited_query: { score: 2, weight: 1.0 },
  topic_switched: { score: 2, weight: 1.0 },
  continued_topic: { score: 3, weight: 1.0 },
  copied_response: { score: 4, weight: 1.0 },
  bookmarked: { score: 5, weight: 1.0 },
  regenerated: { score: 2, weight: 1.0 },
  session_timeout: { score: 3, weight: 1.0 },
}

/**
 * Compute weighted satisfaction rating (1-5) from detected signals.
 * @param signals - array of satisfaction signals
 * @returns integer score from 1 to 5
 */
export function calculateSatisfaction(signals: SatisfactionSignal[]): number {
  if (!signals || signals.length === 0) {
    return 3
  }
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const sig of signals) {
    const config = SIGNAL_WEIGHTS[sig]
    if (config) {
      totalWeightedScore += config.score * config.weight
      totalWeight += config.weight
    }
  }

  if (totalWeight === 0) return 3
  const rawScore = totalWeightedScore / totalWeight
  return Math.min(5, Math.max(1, Math.round(rawScore)))
}

/**
 * Extract satisfaction behavioral signals by observing follow-up actions and content.
 */
export function extractSignals(
  followUpQuery?: string | undefined,
  actions?: { copied?: boolean | undefined; bookmarked?: boolean | undefined; regenerated?: boolean | undefined; edited?: boolean | undefined } | undefined,
): SatisfactionSignal[] {
  const signals: SatisfactionSignal[] = []

  if (actions?.copied) signals.push('copied_response')
  if (actions?.bookmarked) signals.push('bookmarked')
  if (actions?.regenerated) signals.push('regenerated')
  if (actions?.edited) signals.push('edited_query')

  if (followUpQuery) {
    const fq = followUpQuery.trim().toLowerCase()
    if (/(谢谢|感谢|多谢|明白了|解决了|搞定了|太棒了|好用|有用|thanks|thank you|great|perfect|awesome|worked)/i.test(fq)) {
      signals.push('explicit_positive')
    } else if (/(不对|错了|不行|还是报错|没有用|有问题|not working|wrong|incorrect|failed|broken)/i.test(fq)) {
      signals.push('explicit_negative')
    } else if (/(换一种方式|重说一遍|换个说法|换个方式说|重新解释|simplify|rephrase|explain again)/i.test(fq)) {
      signals.push('rephrase_requested')
    } else {
      signals.push('continued_topic')
    }
  }

  return signals
}

/** Initial default preferences. */
export const DEFAULT_PREFERENCES: PreferenceSnapshot = {
  responseLength: 'detailed',
  technicalDepth: 'intermediate',
  language: '中文',
  codePreference: 'file_blocks',
  tonePreference: 'casual',
  recurringTopics: [],
}

/**
 * Infer updated user preferences given historical Q&A turns.
 */
export function inferPreferences(
  history: Array<{ query: string; response: string; tokenCount: number }>,
  current?: PreferenceSnapshot,
): PreferenceSnapshot {
  const pref: PreferenceSnapshot = current ? { ...current, recurringTopics: [...current.recurringTopics] } : { ...DEFAULT_PREFERENCES }
  if (history.length === 0) return pref

  // 1. Response length preference based on token count median
  const tokenCounts = history.map(h => h.tokenCount).sort((a, b) => a - b)
  const medianTokens = tokenCounts[Math.floor(tokenCounts.length / 2)] ?? 300
  if (medianTokens < 150) {
    pref.responseLength = 'concise'
  } else if (medianTokens <= 600) {
    pref.responseLength = 'moderate'
  } else {
    pref.responseLength = 'detailed'
  }

  // 2. Language
  let chineseCount = 0
  let englishCount = 0
  for (const item of history) {
    for (let i = 0; i < item.query.length; i++) {
      const code = item.query.charCodeAt(i)
      if (code >= 0x4e00 && code <= 0x9fa5) chineseCount++
      else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) englishCount++
    }
  }
  pref.language = chineseCount >= englishCount ? '中文' : 'English'

  // 3. Technical Depth
  let totalTerms = 0
  let codeBlockChars = 0
  let totalResponseChars = 0
  const techTermsRegex = /(async|await|promise|closure|fiber|thread|pointer|polymorphism|generic|hmr|ast|kernel|mutex|socket|lifecycle|protocol|schema|monad|ipc|sse|wasm)/gi

  for (const item of history) {
    const matches = item.query.match(techTermsRegex)
    if (matches) totalTerms += matches.length
    totalResponseChars += item.response.length
    const codeBlocks = item.response.match(/```[\s\S]*?```/g)
    if (codeBlocks) {
      for (const cb of codeBlocks) codeBlockChars += cb.length
    }
  }

  const codeRatio = totalResponseChars > 0 ? codeBlockChars / totalResponseChars : 0
  if (totalTerms > history.length * 2 || codeRatio > 0.45) {
    pref.technicalDepth = 'expert'
  } else if (totalTerms > history.length * 0.5 || codeRatio > 0.2) {
    pref.technicalDepth = 'intermediate'
  } else {
    pref.technicalDepth = 'beginner'
  }

  // 4. Code Preference
  let wantFullFile = 0
  let hasCode = 0
  for (const item of history) {
    if (/(完整文件|完整代码|整个文件|全量代码|full file|complete file|entire code)/i.test(item.query)) {
      wantFullFile++
    }
    if (/```/.test(item.response)) {
      hasCode++
    }
  }
  if (wantFullFile > 0 || hasCode > history.length * 0.5) {
    pref.codePreference = 'file_blocks'
  } else if (hasCode > 0) {
    pref.codePreference = 'inline'
  } else {
    pref.codePreference = 'no_code'
  }

  // 5. Tone Preference
  let formalCount = 0
  let academicCount = 0
  let casualCount = 0
  for (const item of history) {
    const q = item.query
    if (/(您好|请问|麻烦您|感谢您|劳驾|此致|dear|sincerely)/i.test(q)) formalCount++
    if (/(定义|综上所述|假设|证毕|实验表明|hypothesis|theorem|empirical)/i.test(q)) academicCount++
    if (/(哈哈|呀|呢|佬|牛逼|给力|lol|haha|btw|cool)/i.test(q)) casualCount++
  }
  if (academicCount > formalCount && academicCount > casualCount) {
    pref.tonePreference = 'academic'
  } else if (formalCount > casualCount) {
    pref.tonePreference = 'formal'
  } else {
    pref.tonePreference = 'casual'
  }

  // 6. Recurring Topics (top 10 keywords/topics)
  const topicFrequency: Record<string, number> = {}
  for (const item of history) {
    const words = item.query.split(/[\s,，。？！?!:：]+/).filter(w => w.length >= 2 && w.length <= 15)
    for (const w of words) {
      if (!/^(这个|那个|怎么|如何|什么|可以|为什么|一个|一下|帮我|请问|实现|需要|这是|能够|是否)$/.test(w)) {
        topicFrequency[w] = (topicFrequency[w] ?? 0) + 1
      }
    }
  }
  pref.recurringTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic)

  return pref
}

/**
 * Construct an AnalysisRecord for a completed turn.
 */
export function buildAnalysisRecord(params: {
  id?: string | undefined
  sessionId: string
  turnIndex: number
  timestamp?: number | undefined
  userQuery: string
  assistantResponse: string
  latencyMs?: number | undefined
  followUpQuery?: string | undefined
  actions?: { copied?: boolean | undefined; bookmarked?: boolean | undefined; regenerated?: boolean | undefined; edited?: boolean | undefined } | undefined
  userPreferences?: PreferenceSnapshot | undefined
}): AnalysisRecord {
  const tokenCount = estimateTokens(params.assistantResponse)
  const intent = inferIntent(params.userQuery)
  const signals = extractSignals(params.followUpQuery, params.actions)
  const satisfaction = calculateSatisfaction(signals)

  return {
    id: params.id ?? `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    sessionId: params.sessionId,
    turnIndex: params.turnIndex,
    timestamp: params.timestamp ?? Date.now(),
    userQuery: params.userQuery,
    assistantResponse: params.assistantResponse,
    responseTokenCount: tokenCount,
    latencyMs: params.latencyMs ?? 800,
    inferredIntent: intent,
    inferredSatisfaction: satisfaction,
    satisfactionSignals: signals,
    userPreferences: params.userPreferences ?? DEFAULT_PREFERENCES,
    userRating: null,
    userAccuracyVerdict: null,
    userNote: null,
  }
}
