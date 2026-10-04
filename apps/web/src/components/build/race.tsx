import { type OpponentRace, RACE_NAMES } from '@sybo/shared'
import { cn } from 'cn'

export const raceClasses: Record<OpponentRace, { solid: string; soft: string; text: string; border: string; on: string }> = {
  T: { solid: 'bg-terran text-terran-foreground', soft: 'bg-terran/15 text-terran', text: 'text-terran', border: 'border-terran/40', on: 'data-[state=on]:bg-terran data-[state=on]:text-terran-foreground' },
  Z: { solid: 'bg-zerg text-zerg-foreground', soft: 'bg-zerg/15 text-zerg', text: 'text-zerg', border: 'border-zerg/40', on: 'data-[state=on]:bg-zerg data-[state=on]:text-zerg-foreground' },
  P: { solid: 'bg-protoss text-protoss-foreground', soft: 'bg-protoss/15 text-protoss', text: 'text-protoss', border: 'border-protoss/40', on: 'data-[state=on]:bg-protoss data-[state=on]:text-protoss-foreground' },
  R: { solid: 'bg-random text-random-foreground', soft: 'bg-random/15 text-random', text: 'text-random', border: 'border-random/40', on: 'data-[state=on]:bg-random data-[state=on]:text-random-foreground' },
}

export function RaceIcon({ race, className }: { race: OpponentRace; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded font-heading text-[0.7rem] font-bold',
        raceClasses[race].solid,
        className,
      )}
      title={RACE_NAMES[race]}
      aria-hidden="true"
    >
      {race}
    </span>
  )
}

/** "PvZ" with each letter tinted by race. */
export function Matchup({ race, vsRace, className }: { race: OpponentRace; vsRace: OpponentRace; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-heading text-sm font-bold', className)}
      aria-label={`${RACE_NAMES[race]} versus ${RACE_NAMES[vsRace]}`}
    >
      <RaceIcon race={race} />
      <span className="text-xs text-muted-foreground">vs</span>
      <RaceIcon race={vsRace} />
    </span>
  )
}
