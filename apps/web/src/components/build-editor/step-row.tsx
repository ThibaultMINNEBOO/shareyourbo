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
import { useI18n } from '@/i18n'
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
  const { t } = useI18n()
  return (
    <button
      type="button"
      aria-label={t('editor.table.drag')}
      className="flex h-8 cursor-grab touch-none items-center justify-center text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
      {...handleProps}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}

function SectionRow({ step, onUpdate, handleProps, ...rest }: Props) {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] items-center gap-1 px-1 py-1">
      <DragHandle handleProps={handleProps} />
      <CommitInput
        value={step.label ?? ''}
        onCommit={(label) => label.trim() && onUpdate({ label: label.trim() })}
        aria-label={t('editor.table.sectionTitle')}
        maxLength={80}
        className="font-heading text-sm font-semibold tracking-wider text-primary uppercase"
      />
      <RowMenu step={step} onUpdate={onUpdate} handleProps={handleProps} {...rest} />
    </div>
  )
}

function ActionRow({ step, supply, race, onUpdate, handleProps, ...rest }: Props) {
  const [picking, setPicking] = useState(false)
  const { t } = useI18n()
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
          aria-label={t('editor.table.supply')}
          title={step.supply === undefined ? t('editor.table.supplySuggested') : t('editor.table.supplyManual')}
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
                aria-label={t('editor.table.supplyBlockedLabel')}
              />
            </TooltipTrigger>
            <TooltipContent>
              {t('editor.table.supplyBlocked', { supply: supply.supply, cap: supply.cap })}
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
        aria-label={t('editor.table.gameTime')}
        className="px-1.5 font-mono tabular-nums placeholder:text-muted-foreground/50"
      />

      <div className="flex min-w-0 items-center gap-1">
        <Popover open={picking} onOpenChange={setPicking}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 min-w-0 flex-1 items-center rounded-md px-1.5 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={t('editor.table.changeAction')}
            >
              <ActionLabel actionId={step.actionId} label={step.label} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <ActionPalette
              race={race}
              autoFocus
              placeholder={t('editor.table.replaceWith')}
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
          aria-label={t('editor.table.count')}
          title={t('editor.table.count')}
          className="w-11 shrink-0 px-1 text-center font-mono tabular-nums"
        />
      </div>

      <CommitInput
        value={step.note ?? ''}
        placeholder={t('editor.table.note')}
        maxLength={280}
        onCommit={(note) => onUpdate({ note: note.trim() || undefined })}
        aria-label={t('editor.table.note')}
        className="col-span-3 col-start-3 text-muted-foreground placeholder:text-muted-foreground/40 lg:col-span-1 lg:col-start-auto"
      />

      <div className="row-start-1 col-start-5 lg:col-start-6">
        <RowMenu step={step} supply={supply} race={race} onUpdate={onUpdate} handleProps={handleProps} {...rest} />
      </div>
    </div>
  )
}

function RowMenu({ step, onRemove, onDuplicate, onMove, onInsertSection, isFirst, isLast }: Props) {
  const { t } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t('editor.table.stepActions')} className="opacity-60 group-hover/row:opacity-100">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onMove(-1)} disabled={isFirst}>
            <ArrowUpIcon /> {t('editor.table.moveUp')} <DropdownMenuShortcut>⌥↑</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onMove(1)} disabled={isLast}>
            <ArrowDownIcon /> {t('editor.table.moveDown')} <DropdownMenuShortcut>⌥↓</DropdownMenuShortcut>
          </DropdownMenuItem>
          {step.kind === 'step' && (
            <DropdownMenuItem onSelect={onDuplicate}>
              <CopyIcon /> {t('editor.table.duplicate')} <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={onInsertSection}>
            <HeadingIcon /> {t('editor.table.insertSection')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <Trash2Icon /> {t('editor.table.delete')} <DropdownMenuShortcut>{t('common.keyDelete')}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
