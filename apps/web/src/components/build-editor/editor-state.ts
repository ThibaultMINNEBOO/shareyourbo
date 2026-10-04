import type { BuildInput, BuildTag, OpponentRace, Race, Step, Visibility } from '@sybo/shared'
import { nanoid } from 'nanoid'

export type EditorMeta = {
  title: string
  description: string
  race: Race
  vsRace: OpponentRace
  tags: BuildTag[]
  patch: string
  visibility: Visibility
}

export type EditorDoc = { meta: EditorMeta; steps: Step[] }

export type EditorState = {
  doc: EditorDoc
  /** Insertion point: new steps go right after this index (-1 = top). */
  selected: number
  past: EditorDoc[]
  future: EditorDoc[]
}

export type StepPatch = Partial<Omit<Step, 'id'>>

export type EditorAction =
  | { type: 'meta'; patch: Partial<EditorMeta> }
  | { type: 'insert'; steps: Omit<Step, 'id'>[]; at?: number }
  | { type: 'update'; index: number; patch: StepPatch }
  | { type: 'remove'; index: number }
  | { type: 'duplicate'; index: number }
  | { type: 'move'; from: number; to: number }
  | { type: 'select'; index: number }
  | { type: 'set'; doc: EditorDoc }
  | { type: 'replace'; doc: EditorDoc }
  | { type: 'undo' }
  | { type: 'redo' }

const HISTORY_LIMIT = 100

export const newStepId = () => nanoid(8)

export function emptyDoc(race: Race = 'P'): EditorDoc {
  return {
    meta: { title: '', description: '', race, vsRace: 'Z', tags: [], patch: '', visibility: 'public' },
    steps: [],
  }
}

export function initEditor(doc: EditorDoc): EditorState {
  return { doc, selected: doc.steps.length - 1, past: [], future: [] }
}

function clamp(index: number, length: number) {
  return Math.max(-1, Math.min(index, length - 1))
}

/** Apply a document change and record the previous doc for undo. */
function commit(state: EditorState, doc: EditorDoc, selected = state.selected): EditorState {
  return {
    doc,
    selected: clamp(selected, doc.steps.length),
    past: [...state.past, state.doc].slice(-HISTORY_LIMIT),
    future: [],
  }
}

function withSteps(state: EditorState, steps: Step[], selected?: number) {
  return commit(state, { ...state.doc, steps }, selected)
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const { steps } = state.doc
  switch (action.type) {
    case 'meta':
      return commit(state, { ...state.doc, meta: { ...state.doc.meta, ...action.patch } })
    case 'insert': {
      const at = action.at ?? state.selected + 1
      const inserted = action.steps.map((s) => ({ ...s, id: newStepId() }) as Step)
      const next = [...steps.slice(0, at), ...inserted, ...steps.slice(at)]
      return withSteps(state, next, at + inserted.length - 1)
    }
    case 'update': {
      const current = steps[action.index]
      if (!current) return state
      const next = [...steps]
      next[action.index] = { ...current, ...action.patch } as Step
      return withSteps(state, next)
    }
    case 'remove': {
      if (!steps[action.index]) return state
      const next = steps.filter((_, i) => i !== action.index)
      return withSteps(state, next, action.index <= state.selected ? state.selected - 1 : state.selected)
    }
    case 'duplicate': {
      const current = steps[action.index]
      if (!current) return state
      const next = [...steps.slice(0, action.index + 1), { ...current, id: newStepId() }, ...steps.slice(action.index + 1)]
      return withSteps(state, next, action.index + 1)
    }
    case 'move': {
      const { from, to } = action
      if (from === to || !steps[from] || to < 0 || to >= steps.length) return state
      const next = [...steps]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved!)
      return withSteps(state, next, to)
    }
    case 'select':
      return { ...state, selected: clamp(action.index, steps.length) }
    case 'set':
      return commit(state, action.doc)
    case 'replace':
      return initEditor(action.doc)
    case 'undo': {
      const previous = state.past.at(-1)
      if (!previous) return state
      return {
        doc: previous,
        selected: clamp(state.selected, previous.steps.length),
        past: state.past.slice(0, -1),
        future: [state.doc, ...state.future],
      }
    }
    case 'redo': {
      const [next, ...future] = state.future
      if (!next) return state
      return { doc: next, selected: clamp(state.selected, next.steps.length), past: [...state.past, state.doc], future }
    }
  }
}

/** Editor document → API payload (empty optional fields dropped). */
export function toBuildInput(doc: EditorDoc): BuildInput {
  const { meta } = doc
  return {
    title: meta.title,
    description: meta.description,
    race: meta.race,
    vsRace: meta.vsRace,
    tags: meta.tags,
    patch: meta.patch.trim() || undefined,
    visibility: meta.visibility,
    steps: doc.steps.map((s) => ({
      ...s,
      label: s.label?.trim() || undefined,
      note: s.note?.trim() || undefined,
    })),
  }
}

/** Parse "2 probe", "probe x2" or "probe" into a count and a search query. */
export function parseQuickEntry(input: string): { count: number; query: string } {
  const value = input.trim()
  const prefix = value.match(/^(\d{1,2})\s*[x×]?\s+(.+)$/i)
  if (prefix) return { count: Math.max(1, Number(prefix[1])), query: prefix[2]! }
  const suffix = value.match(/^(.+?)\s+[x×]\s*(\d{1,2})$/i)
  if (suffix) return { count: Math.max(1, Number(suffix[2])), query: suffix[1]! }
  return { count: 1, query: value }
}
