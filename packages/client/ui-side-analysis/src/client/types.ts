/**
 * Types and interfaces for the conversation side analysis panel.
 */

/** User preference dimensions inferred across conversation turns. */
export interface PreferenceSnapshot {
  /** Inferred response length preference. */
  responseLength: 'concise' | 'moderate' | 'detailed'
  /** Inferred technical depth preference. */
  technicalDepth: 'beginner' | 'intermediate' | 'expert'
  /** Primary language used by user. */
  language: string
  /** Code display format preference. */
  codePreference: 'inline' | 'file_blocks' | 'no_code'
  /** Inferred communication tone preference. */
  tonePreference: 'formal' | 'casual' | 'academic'
  /** Up to 10 recurring topics identified in conversations. */
  recurringTopics: string[]
}

/** Recognized satisfaction behavior signals. */
export type SatisfactionSignal =
  | 'explicit_positive'
  | 'copied_response'
  | 'bookmarked'
  | 'continued_topic'
  | 'rephrase_requested'
  | 'regenerated'
  | 'edited_query'
  | 'topic_switched'
  | 'explicit_negative'
  | 'session_timeout'

/** Analysis record produced per Q&A turn. */
export interface AnalysisRecord {
  /** Unique ID for this analysis record. */
  id: string
  /** Associated session ID. */
  sessionId: string
  /** 1-based turn index. */
  turnIndex: number
  /** Epoch timestamp in milliseconds. */
  timestamp: number

  // --- Raw Data ---
  /** Original user prompt text. */
  userQuery: string
  /** Completed assistant response text. */
  assistantResponse: string
  /** Approximate token count of assistant response. */
  responseTokenCount: number
  /** Latency in ms from start to completion. */
  latencyMs: number

  // --- Automatic Analysis ---
  /** Inferred user intent (e.g. 代码调试, 概念解释, 创意写作, etc.). */
  inferredIntent: string
  /** Inferred satisfaction rating (1-5). */
  inferredSatisfaction: number
  /** List of behavioral signals leading to inferred satisfaction. */
  satisfactionSignals: string[]
  /** Snapshot of user preferences at this turn. */
  userPreferences: PreferenceSnapshot

  // --- User Verification ---
  /** User-provided rating (1-5), or null if unrated. */
  userRating: number | null
  /** User verification of inference accuracy. */
  userAccuracyVerdict: 'accurate' | 'inaccurate' | null
  /** User notes / feedback. */
  userNote: string | null
}
