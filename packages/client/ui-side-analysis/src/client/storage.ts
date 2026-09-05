/**
 * Storage adapter providing dual-write persistence via localStorage and IndexedDB.
 */
import type { AnalysisRecord, PreferenceSnapshot } from './types.ts'

const DB_NAME = 'dsh_side_analysis_db'
const DB_VERSION = 1
const STORE_RECORDS = 'records'
const STORE_PREFS = 'preferences'

const LOCAL_STORAGE_PREFIX_RECORDS = 'dsh_analysis_records_'
const LOCAL_STORAGE_PREFIX_PREFS = 'dsh_analysis_prefs_'

// In-memory cache to guarantee synchronous availability
const memoryRecordsCache: Map<string, AnalysisRecord[]> = new Map()
const memoryPrefsCache: Map<string, PreferenceSnapshot> = new Map()

/** Safely open or get IndexedDB database instance. */
function openDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null)
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          const store = db.createObjectStore(STORE_RECORDS, { keyPath: 'id' })
          store.createIndex('sessionId', 'sessionId', { unique: false })
          store.createIndex('turnIndex', 'turnIndex', { unique: false })
        }
        if (!db.objectStoreNames.contains(STORE_PREFS)) {
          db.createObjectStore(STORE_PREFS, { keyPath: 'sessionId' })
        }
      }
      request.onsuccess = () => { resolve(request.result) }
      request.onerror = () => { resolve(null) }
    } catch {
      resolve(null)
    }
  })
}

/** Synchronous read from localStorage with in-memory fallback. */
export function getRecords(sessionId: string): AnalysisRecord[] {
  if (!sessionId) return []
  if (memoryRecordsCache.has(sessionId)) {
    return memoryRecordsCache.get(sessionId)!
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX_RECORDS + sessionId)
      if (raw) {
        const parsed = JSON.parse(raw) as AnalysisRecord[]
        memoryRecordsCache.set(sessionId, parsed)
        return parsed
      }
    } catch {
      // Ignored
    }
  }
  return []
}

/** Synchronous read of preferences. */
export function getPreferences(sessionId: string): PreferenceSnapshot | null {
  if (!sessionId) return null
  if (memoryPrefsCache.has(sessionId)) {
    return memoryPrefsCache.get(sessionId)!
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX_PREFS + sessionId)
      if (raw) {
        const parsed = JSON.parse(raw) as PreferenceSnapshot
        memoryPrefsCache.set(sessionId, parsed)
        return parsed
      }
    } catch {
      // Ignored
    }
  }
  return null
}

/** Save an analysis record to both localStorage and IndexedDB. */
export async function saveRecord(record: AnalysisRecord): Promise<void> {
  const { sessionId } = record
  const current = getRecords(sessionId)
  const existingIdx = current.findIndex(r => r.id === record.id)
  let updated: AnalysisRecord[]
  if (existingIdx >= 0) {
    updated = [...current]
    updated[existingIdx] = record
  } else {
    updated = [...current, record].sort((a, b) => a.turnIndex - b.turnIndex)
  }

  // 1. Update memory cache
  memoryRecordsCache.set(sessionId, updated)

  // 2. Write to localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX_RECORDS + sessionId, JSON.stringify(updated))
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  // 3. Write to IndexedDB
  const db = await openDB()
  if (db) {
    try {
      const tx = db.transaction(STORE_RECORDS, 'readwrite')
      const store = tx.objectStore(STORE_RECORDS)
      store.put(record)
    } catch {
      // Ignored
    }
  }
}

/** Update user feedback fields on a record. */
export async function updateRecordVerification(
  sessionId: string,
  recordId: string,
  updates: Partial<Pick<AnalysisRecord, 'userRating' | 'userAccuracyVerdict' | 'userNote'>>,
): Promise<void> {
  const records = getRecords(sessionId)
  const target = records.find(r => r.id === recordId)
  if (!target) return

  const updated: AnalysisRecord = {
    ...target,
    ...updates,
  }
  await saveRecord(updated)
}

/** Save preferences snapshot to storage. */
export async function savePreferences(sessionId: string, pref: PreferenceSnapshot): Promise<void> {
  memoryPrefsCache.set(sessionId, pref)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX_PREFS + sessionId, JSON.stringify(pref))
    } catch {
      // Storage quota exceeded
    }
  }
  const db = await openDB()
  if (db) {
    try {
      const tx = db.transaction(STORE_PREFS, 'readwrite')
      const store = tx.objectStore(STORE_PREFS)
      store.put({ sessionId, ...pref })
    } catch {
      // Ignored
    }
  }
}

/** Clear records and preferences for a session. */
export async function clearSessionData(sessionId: string): Promise<void> {
  memoryRecordsCache.delete(sessionId)
  memoryPrefsCache.delete(sessionId)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX_RECORDS + sessionId)
      localStorage.removeItem(LOCAL_STORAGE_PREFIX_PREFS + sessionId)
    } catch {
      // Ignored
    }
  }
  const db = await openDB()
  if (db) {
    try {
      const tx = db.transaction([STORE_RECORDS, STORE_PREFS], 'readwrite')
      const recStore = tx.objectStore(STORE_RECORDS)
      const index = recStore.index('sessionId')
      const req = index.openCursor(IDBKeyRange.only(sessionId))
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      const prefStore = tx.objectStore(STORE_PREFS)
      prefStore.delete(sessionId)
    } catch {
      // Ignored
    }
  }
}
