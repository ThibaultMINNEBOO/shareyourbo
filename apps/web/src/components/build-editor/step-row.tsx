import { type Race, type Step, type SupplyInfo, formatTime, parseTime } from '@sybo/shared'
import { cn } from 'cn'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  GripVerticalIcon,
  HeadingIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useState } from 'react'
import { ActionLabel } from '@/components/build/action-chip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ActionPalette } from './action-palette'
import { CommitInput } from './commit-input'
import type { StepPatch } from './editor-state'

export type RowHandlers = {
  onUpdate: (patch: StepPatch) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (direction: -1 | 1) => void
  onInsertSection: () => void
  onSelect: () => void
}

type Props = RowHandlers & {
  step: Step
  supply: SupplyInfo
  race: Race
  selected: boolean
  isFirst: boolean
  isLast: boolean
  /** Drag handle props from the sortable wrapper. */
  handleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function StepRow(props: Props) {
  const { step, selected, onSelect } = props
  return (
    <div
      onFocusCapture={onSelect}
      onPointerDown={onSelect}
      data-selected={selected || undefined}
      className={cn(
        'group/row relative rounded-md border border-transparent transition-colors hover:bg-muted/40',
        'data-selected:border-primary/40 data-selected:bg-primary/5',
      )}
    >
      {step.kind === 'section' ? <SectionRow {...props} /> : <ActionRow {...props} />}
    </div>
  )
}

function DragHandle({ handleProps }: Pick<Props, 'handleProps'>) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className="flex h-8 cursor-grab touch-none items-center justify-center text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
      {...handleProps}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}

function SectionRow({ step, onUpdate, handleProps, ...rest }: Props) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] items-center gap-1 px-1 py-1">
      <DragHandle handleProps={handleProps} />
      <CommitInput
        value={step.label ?? ''}
        onCommit={(label) => label.trim() && onUpdate({ label: label.trim() })}
        aria-label="Section title"
        maxLength={80}
        className="font-heading text-sm font-semibold tracking-wider text-primary uppercase"
      />
      <RowMenu step={step} onUpdate={onUpdate} handleProps={handleProps} {...rest} />
    </div>
  )
}

function ActionRow({ step, supply, race, onUpdate, handleProps, ...rest }: Props) {
  const [picking, setPicking] = useState(false)
  return (
    <div className="grid grid-cols-[1.25rem_3rem_3.75rem_minmax(0,1fr)_2rem] items-center gap-x-1 px-1 py-1 lg:grid-cols-[1.25rem_3rem_3.75rem_minmax(0,1.1fr)_minmax(0,1fr)_2rem]">
      <DragHandle handleProps={handleProps} />

      <div className="relative">
        <CommitInput
          value={step.supply?.toString() ?? ''}
          placeholder={String(supply.supply)}
          onCommit={(value) => {
            const n = Number(value)
            if (value.trim() === '') onUpdate({ supply: undefined })
            else if (Number.isInteger(n) && n >= 0 && n <= 200) onUpdate({ supply: n })
          }}
          inputMode="numeric"
          aria-label="Supply"
          title={step.supply === undefined ? 'Suggested supply — type to override' : 'Supply (clear to use the suggestion)'}
          className={cn(
            'px-1.5 text-right font-mono tabular-nums placeholder:text-muted-foreground/70',
            step.supply !== undefined && 'font-semibold',
            supply.blocked && 'border-destructive/50 text-destructive placeholder:text-destructive/70',
          )}
        />
        {supply.blocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <TriangleAlertIcon
                className="absolute -top-1 -left-1 size-3.5 text-destructive"
                aria-label="Supply blocked"
              />
            </TooltipTrigger>
            <TooltipContent>
              Supply blocked: {supply.supply}/{supply.cap}. Add a supply structure earlier.
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <CommitInput
        value={step.time !== undefined ? formatTime(step.time) : ''}
        placeholder="m:ss"
        onCommit={(value) => {
          if (value.trim() === '') return onUpdate({ time: undefined })
          const seconds = parseTime(value)
          if (seconds !== null) onUpdate({ time: seconds })
        }}
        aria-label="Game time"
        className="px-1.5 font-mono tabular-nums placeholder:text-muted-foreground/50"
      />

      <div className="flex min-w-0 items-center gap-1">
        <Popover open={picking} onOpenChange={setPicking}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 min-w-0 flex-1 items-center rounded-md px-1.5 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="Change action"
            >
              <ActionLabel actionId={step.actionId} label={step.label} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <ActionPalette
              race={race}
              autoFocus
              placeholder="Replace with…"
              listClassName="max-h-72"
              className="border-0"
              onPick={({ actionId, label, count }) => {
                onUpdate({ actionId, label: actionId ? undefined : label, ...(count > 1 ? { count } : {}) })
                setPicking(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <CommitInput
          value={String(step.count)}
          onCommit={(value) => {
            const n = Number(value)
            if (Number.isInteger(n) && n >= 1 && n <= 50) onUpdate({ count: n })
          }}
          inputMode="numeric"
          aria-label="Count"
          title="Count"
          className="w-11 shrink-0 px-1 text-center font-mono tabular-nums"
        />
      </div>

      <CommitInput
        value={step.note ?? ''}
        placeholder="Note"
        maxLength={280}
        onCommit={(note) => onUpdate({ note: note.trim() || undefined })}
        aria-label="Note"
        className="col-span-3 col-start-3 text-muted-foreground placeholder:text-muted-foreground/40 lg:col-span-1 lg:col-start-auto"
      />

      <div className="row-start-1 col-start-5 lg:col-start-6">
        <RowMenu step={step} supply={supply} race={race} onUpdate={onUpdate} handleProps={handleProps} {...rest} />
      </div>
    </div>
  )
}

function RowMenu({ step, onRemove, onDuplicate, onMove, onInsertSection, isFirst, isLast }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Step actions" className="opacity-60 group-hover/row:opacity-100">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onMove(-1)} disabled={isFirst}>
            <ArrowUpIcon /> Move up <DropdownMenuShortcut>⌥↑</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onMove(1)} disabled={isLast}>
            <ArrowDownIcon /> Move down <DropdownMenuShortcut>⌥↓</DropdownMenuShortcut>
          </DropdownMenuItem>
          {step.kind === 'step' && (
            <DropdownMenuItem onSelect={onDuplicate}>
              <CopyIcon /> Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={onInsertSection}>
            <HeadingIcon /> Insert section above
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <Trash2Icon /> Delete <DropdownMenuShortcut>Del</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
