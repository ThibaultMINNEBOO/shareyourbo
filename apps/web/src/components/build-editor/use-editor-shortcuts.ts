import { useEffect, useEffectEvent } from 'react'
import type { EditorAction, EditorState } from './editor-state'

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Editor keyboard shortcuts. Text fields keep their native behavior; step
 * shortcuts apply when focus is outside an input.
 *   / or ⌘K      focus the action palette
 *   ⌘Z / ⌘⇧Z     undo / redo
 *   ↑ ↓          change the selected step
 *   ⌥↑ ⌥↓        move the selected step
 *   ⌘D           duplicate the selected step
 *   Del / ⌫      delete the selected step
 */
export function useEditorShortcuts(
  state: EditorState,
  dispatch: React.Dispatch<EditorAction>,
  focusPalette: () => void,
) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    const key = e.key.toLowerCase()
    const editable = isEditable(e.target)
    const { selected, doc } = state

    if (mod && key === 'k') {
      e.preventDefault()
      return focusPalette()
    }
    if (editable || e.defaultPrevented) return
    if (document.querySelector('[role="dialog"], [role="menu"], [role="alertdialog"]')) return

    let handled = true
    if (e.key === '/') focusPalette()
    else if (mod && key === 'z') dispatch({ type: e.shiftKey ? 'redo' : 'undo' })
    else if (mod && key === 'y') dispatch({ type: 'redo' })
    else if (selected < 0) handled = false
    else if (e.altKey && e.key === 'ArrowUp') dispatch({ type: 'move', from: selected, to: selected - 1 })
    else if (e.altKey && e.key === 'ArrowDown') dispatch({ type: 'move', from: selected, to: selected + 1 })
    else if (e.key === 'ArrowUp') dispatch({ type: 'select', index: Math.max(0, selected - 1) })
    else if (e.key === 'ArrowDown') dispatch({ type: 'select', index: Math.min(doc.steps.length - 1, selected + 1) })
    else if (mod && key === 'd') dispatch({ type: 'duplicate', index: selected })
    else if (e.key === 'Delete' || e.key === 'Backspace') dispatch({ type: 'remove', index: selected })
    else handled = false

    if (handled) e.preventDefault()
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
