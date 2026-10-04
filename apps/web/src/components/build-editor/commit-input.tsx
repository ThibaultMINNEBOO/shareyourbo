import { cn } from 'cn'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

type Props = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> & {
  value: string
  /** Called on blur/Enter when the text changed; invalid input simply reverts. */
  onCommit: (value: string) => void
}

/**
 * Input that edits a local draft and commits on blur or Enter (Escape
 * reverts), so each edit is one undo step instead of one per keystroke.
 */
export function CommitInput({ value, onCommit, className, onKeyDown, onBlur, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft !== null && draft !== value) onCommit(draft)
    setDraft(null)
  }

  return (
    <Input
      {...props}
      value={draft ?? value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => {
        commit()
        onBlur?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          setDraft(null)
          e.currentTarget.blur()
        }
        onKeyDown?.(e)
      }}
      className={cn('h-8 border-transparent bg-transparent shadow-none hover:border-input focus-visible:bg-background dark:bg-transparent', className)}
    />
  )
}
