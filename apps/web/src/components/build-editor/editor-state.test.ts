import { describe, expect, it } from 'vitest'
import { editorReducer, emptyDoc, initEditor, parseQuickEntry } from './editor-state'

const step = (actionId: string) => ({ kind: 'step' as const, count: 1, actionId })

function withSteps(...ids: string[]) {
  return editorReducer(initEditor(emptyDoc()), { type: 'insert', steps: ids.map(step) })
}

describe('editorReducer', () => {
  it('inserts after the selection and selects the new step', () => {
    let state = withSteps('probe', 'pylon')
    state = editorReducer(state, { type: 'select', index: 0 })
    state = editorReducer(state, { type: 'insert', steps: [step('gateway')] })
    expect(state.doc.steps.map((s) => s.actionId)).toEqual(['probe', 'gateway', 'pylon'])
    expect(state.selected).toBe(1)
  })

  it('moves, duplicates and removes', () => {
    let state = withSteps('probe', 'pylon', 'gateway')
    state = editorReducer(state, { type: 'move', from: 2, to: 0 })
    expect(state.doc.steps.map((s) => s.actionId)).toEqual(['gateway', 'probe', 'pylon'])
    state = editorReducer(state, { type: 'duplicate', index: 1 })
    expect(state.doc.steps.map((s) => s.actionId)).toEqual(['gateway', 'probe', 'probe', 'pylon'])
    expect(state.doc.steps[1]!.id).not.toBe(state.doc.steps[2]!.id)
    state = editorReducer(state, { type: 'remove', index: 0 })
    expect(state.doc.steps.map((s) => s.actionId)).toEqual(['probe', 'probe', 'pylon'])
  })

  it('undoes and redoes document changes', () => {
    let state = withSteps('probe')
    state = editorReducer(state, { type: 'update', index: 0, patch: { count: 3 } })
    state = editorReducer(state, { type: 'undo' })
    expect(state.doc.steps[0]!.count).toBe(1)
    state = editorReducer(state, { type: 'redo' })
    expect(state.doc.steps[0]!.count).toBe(3)
  })

  it('does not record selection changes in history', () => {
    let state = withSteps('probe', 'pylon')
    const pastLength = state.past.length
    state = editorReducer(state, { type: 'select', index: 0 })
    expect(state.past).toHaveLength(pastLength)
  })
})

describe('parseQuickEntry', () => {
  it.each([
    ['probe', 1, 'probe'],
    ['2 probe', 2, 'probe'],
    ['3x marine', 3, 'marine'],
    ['zergling x4', 4, 'zergling'],
    ['+1 weapons', 1, '+1 weapons'],
  ])('parses %s', (input, count, query) => {
    expect(parseQuickEntry(input)).toEqual({ count, query })
  })
})
