import {
  ACTIONS_BY_RACE,
  type ActionKind,
  type GameAction,
  type Race,
  searchActions,
} from '@sybo/shared'
import { cn } from 'cn'
import { StickyNoteIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionBadge } from '@/components/build/action-chip'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/i18n'
import { useActionNames } from '@/lib/game-names'
import { parseQuickEntry } from './editor-state'

export type PaletteSelection = { actionId?: string; label?: string; count: number }

const KIND_ORDER: ActionKind[] = ['unit', 'building', 'upgrade', 'ability']
const NOTE_VALUE = '__note__'

type Props = {
  race: Race
  onPick: (selection: PaletteSelection) => void
  inputRef?: React.Ref<HTMLInputElement>
  autoFocus?: boolean
  placeholder?: string
  className?: string
  listClassName?: string
}

/**
 * Searchable action picker. Enter adds the highlighted action and clears the
 * query so builds can be typed in one go: "2 probe ⏎ pylon ⏎ gate ⏎".
 */
export function ActionPalette({ race, onPick, inputRef, autoFocus, placeholder, className, listClassName }: Props) {
  const [input, setInput] = useState('')
  const { t, rich } = useI18n()
  const { count, query } = parseQuickEntry(input)
  const results = useMemo(() => (query ? searchActions(race, query) : []), [race, query])
  const grouped = useMemo(
    () =>
      KIND_ORDER.map((kind) => ({ kind, actions: ACTIONS_BY_RACE[race].filter((a) => a.kind === kind) })),
    [race],
  )
  const [highlighted, setHighlighted] = useState('')

  function pick(value: string) {
    if (value === NOTE_VALUE) onPick({ label: query, count })
    else onPick({ actionId: value, count })
    setInput('')
    setHighlighted('')
  }

  return (
    <Command
      shouldFilter={false}
      loop
      value={highlighted}
      onValueChange={setHighlighted}
      className={cn('rounded-xl! border bg-card', className)}
    >
      <CommandInput
        ref={inputRef}
        autoFocus={autoFocus}
        value={input}
        onValueChange={(value) => {
          setInput(value)
          const next = parseQuickEntry(value).query
          setHighlighted(next ? (searchActions(race, next)[0]?.id ?? NOTE_VALUE) : '')
        }}
        placeholder={placeholder ?? t('editor.palette.placeholder')}
        aria-label={t('editor.palette.search')}
      />
      <CommandList className={cn('max-h-none', listClassName)}>
        {query ? (
          <>
            <CommandGroup heading={count > 1 ? t('editor.palette.addCount', { count }) : t('editor.palette.bestMatches')}>
              {results.map((action) => (
                <PaletteItem key={action.id} action={action} count={count} onSelect={pick} />
              ))}
              <CommandItem value={NOTE_VALUE} onSelect={pick} className="gap-3">
                <span className="inline-flex h-6 min-w-10 items-center justify-center rounded border border-dashed text-muted-foreground">
                  <StickyNoteIcon className="size-3.5" />
                </span>
                <span className="truncate">
                  {rich('editor.palette.addAsText', { query: <span className="font-medium">{query}</span> })}
                </span>
              </CommandItem>
            </CommandGroup>
            <CommandEmpty>{t('editor.palette.noMatch')}</CommandEmpty>
          </>
        ) : (
          grouped.map(({ kind, actions }) => (
            <CommandGroup key={kind} heading={t(`actionKinds.${kind}`)}>
              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-1">
                {actions.map((action) => (
                  <PaletteItem key={action.id} action={action} count={1} onSelect={pick} compact />
                ))}
              </div>
            </CommandGroup>
          ))
        )}
      </CommandList>
      <p className="hidden items-center gap-1.5 border-t px-3 py-2 text-xs text-muted-foreground sm:flex">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd> {t('editor.palette.navigate')} <Kbd>⏎</Kbd> {t('editor.palette.add')} · {t('editor.palette.countHint')}
      </p>
    </Command>
  )
}

function PaletteItem({
  action,
  count,
  onSelect,
  compact,
}: {
  action: GameAction
  count: number
  onSelect: (value: string) => void
  compact?: boolean
}) {
  const { name } = useActionNames()
  return (
    <CommandItem value={action.id} onSelect={onSelect} className="gap-3">
      <ActionBadge action={action} />
      <span className="truncate">{name(action)}</span>
      {!compact && count > 1 && <span className="font-mono text-muted-foreground">×{count}</span>}
      {!compact && (action.minerals > 0 || action.gas > 0) && (
        <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {action.minerals}
          {action.gas > 0 && <span className="text-primary">/{action.gas}</span>}
        </span>
      )}
    </CommandItem>
  )
}
