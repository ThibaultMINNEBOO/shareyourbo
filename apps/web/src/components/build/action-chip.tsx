import { type ActionKind, type GameAction, getAction } from '@sybo/shared'
import { cn } from 'cn'
import { ArrowUpCircleIcon, Building2Icon, type LucideIcon, SwordsIcon, ZapIcon } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useActionNames } from '@/lib/game-names'
import { raceClasses } from './race'

export const kindIcons: Record<ActionKind, LucideIcon> = {
  unit: SwordsIcon,
  building: Building2Icon,
  upgrade: ArrowUpCircleIcon,
  ability: ZapIcon,
}

/** Compact square badge with the action's short label, tinted by race. */
export function ActionBadge({ action, className }: { action: GameAction; className?: string }) {
  const { short } = useActionNames()
  const { race } = action
  return (
    <span
      className={cn(
        'inline-flex h-6 min-w-10 shrink-0 items-center justify-center rounded border px-1 font-heading text-[0.7rem] leading-none font-bold tracking-wide uppercase',
        raceClasses[race].soft,
        raceClasses[race].border,
        className,
      )}
      aria-hidden="true"
    >
      {short(action)}
    </span>
  )
}

/** A step's action: badge + name (+ count), or the free-text label. */
export function ActionLabel({
  actionId,
  label,
  count = 1,
  size = 'default',
}: {
  actionId?: string
  label?: string
  count?: number
  size?: 'default' | 'lg'
}) {
  const action = getAction(actionId)
  const { t } = useI18n()
  const names = useActionNames()
  const countText = count > 1 && <span className="font-mono text-muted-foreground">×{count}</span>
  if (!action) {
    return (
      <span className={cn('flex min-w-0 items-center gap-2', size === 'lg' && 'text-2xl')}>
        <span className="inline-flex h-6 min-w-10 shrink-0 items-center justify-center rounded border border-dashed text-muted-foreground">
          <span className="sr-only">{t('build.note')}</span>·
        </span>
        <span className="truncate italic">{label}</span>
        {countText}
      </span>
    )
  }
  return (
    <span className={cn('flex min-w-0 items-center gap-2', size === 'lg' && 'gap-3 text-2xl font-semibold')}>
      <ActionBadge action={action} className={cn(size === 'lg' && 'h-9 min-w-14 text-sm')} />
      <span className="truncate font-medium">{names.name(action)}</span>
      {countText}
    </span>
  )
}
