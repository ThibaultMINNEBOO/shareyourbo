import { type Race, type Step, computeSupply, formatTime } from '@sybo/shared'
import { cn } from 'cn'
import { ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionLabel } from '@/components/build/action-chip'

type Props = {
  steps: Step[]
  race: Race
  /** Index of the highlighted step (play mode). */
  currentIndex?: number
  onStepClick?: (index: number) => void
  className?: string
}

/** Read-only build order: sections, supply, time, action and note per row. */
export function StepList({ steps, race, currentIndex, onStepClick, className }: Props) {
  const supplies = useMemo(() => computeSupply(race, steps), [race, steps])
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const hasTimes = steps.some((s) => s.time !== undefined)

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  let hiddenBy: string | null = null

  return (
    <ol className={cn('flex flex-col', className)} aria-label="Build order steps">
      {steps.map((step, i) => {
        if (step.kind === 'section') {
          hiddenBy = collapsed.has(step.id) ? step.id : null
          const isCollapsed = collapsed.has(step.id)
          return (
            <li key={step.id} className="mt-4 first:mt-0">
              <button
                type="button"
                onClick={() => toggle(step.id)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center gap-2 border-b border-primary/30 pb-1.5 text-left font-heading text-sm font-semibold tracking-wider text-primary uppercase hover:text-primary/80"
              >
                <ChevronDownIcon className={cn('size-4 transition-transform', isCollapsed && '-rotate-90')} />
                {step.label}
              </button>
            </li>
          )
        }
        if (hiddenBy) return null

        const info = supplies[i]!
        const isCurrent = currentIndex === i
        const isDone = currentIndex !== undefined && i < currentIndex
        const Row = onStepClick ? 'button' : 'div'

        return (
          <li key={step.id}>
            <Row
              {...(onStepClick ? { type: 'button' as const, onClick: () => onStepClick(i) } : {})}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'grid w-full grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                hasTimes && 'grid-cols-[2.75rem_3rem_minmax(0,1fr)]',
                'hover:bg-muted/60',
                isCurrent && 'bg-primary/15 ring-1 ring-primary/50 hover:bg-primary/20',
                isDone && 'opacity-45',
              )}
            >
              <span
                className={cn(
                  'text-right font-mono tabular-nums',
                  info.overridden ? 'font-semibold' : 'text-muted-foreground',
                )}
                title={info.overridden ? 'Supply' : 'Suggested supply'}
              >
                {info.supply}
              </span>
              {hasTimes && (
                <span className="font-mono text-muted-foreground tabular-nums">
                  {step.time !== undefined ? formatTime(step.time) : ''}
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                <ActionLabel actionId={step.actionId} label={step.label} count={step.count} />
                {step.note && <span className="truncate text-xs text-muted-foreground sm:text-sm">{step.note}</span>}
              </span>
            </Row>
          </li>
        )
      })}
    </ol>
  )
}
