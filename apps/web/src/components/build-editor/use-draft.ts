import { useEffect, useState } from 'react'
import type { EditorDoc } from './editor-state'

const PREFIX = 'sybo-draft:'
const SAVE_DELAY_MS = 600

type StoredDraft = { doc: EditorDoc; savedAt: number }

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const draft = JSON.parse(raw) as StoredDraft
    return Array.isArray(draft?.doc?.steps) && draft.doc.meta ? draft : null
  } catch {
    return null
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // storage unavailable
  }
}

/**
 * Persists unsaved editor changes per build so a closed tab or crash
 * doesn't lose work. Returns a draft found on mount, to offer restoring.
 */
export function useDraft(key: string, doc: EditorDoc, dirty: boolean) {
  const [found, setFound] = useState(() => readDraft(key))

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify({ doc, savedAt: Date.now() } satisfies StoredDraft))
      } catch {
        // storage full or unavailable: drafts are best-effort
      }
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [key, doc, dirty])

  return {
    draft: found,
    dismiss: () => {
      clearDraft(key)
      setFound(null)
    },
    consume: () => setFound(null),
  }
}
