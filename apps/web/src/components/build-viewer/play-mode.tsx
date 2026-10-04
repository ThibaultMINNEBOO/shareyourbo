import { type Race, type Step, computeSupply, formatTime, lastStepReachedAt } from '@sybo/shared'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { ActionLabel } from '@/components/build/action-chip'
import { Matchup } from '@/components/build/race'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/i18n'
import { StepList } from './step-list'
import { useGameClock, useWakeLock } from './use-game-clock'

type Props = { slug: string; title: string; race: Race; vsRace: Race | 'R'; steps: Step[] }

export function PlayMode({ slug, title, race, vsRace, steps }: Props) {
  const playable = useMemo(() => steps.map((s, i) => ({ step: s, index: i })).filter((s) => s.step.kind === 'step'), [steps])
  const supplies = useMemo(() => computeSupply(race, steps), [race, steps])
  const [position, setPosition] = useState(0)
  const clock = useGameClock()
  const { t } = useI18n()
  const listRef = useRef<HTMLDivElement>(null)
  useWakeLock(true)

  const current = playable[position]
  const upcoming = playable.slice(position + 1, position + 3)

  // While the clock runs, follow timed steps: jump to the last step whose time has passed.
  useEffect(() => {
    if (!clock.running) return
    const target = lastStepReachedAt(
      playable.map((p) => p.step),
      clock.seconds,
    )
    if (target > position) setPosition(target)
  }, [clock.seconds, clock.running, playable, position])

  useEffect(() => {
    listRef.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [position])

  const go = (delta: number) => setPosition((p) => Math.max(0, Math.min(playable.length - 1, p + delta)))

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Enter') go(1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
    else if (e.key === ' ') clock.toggle()
    else if (e.key.toLowerCase() === 'r') {
      clock.reset()
      setPosition(0)
    } else return
    e.preventDefault()
  })

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!current) return null
  const supply = supplies[current.index]!
  const progress = ((position + 1) / playable.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-4 py-2">
        <Matchup race={race} vsRace={vsRace} />
        <h1 className="truncate font-heading text-base font-semibold">{title}</h1>
        <Button variant="ghost" size="icon" className="ml-auto" asChild>
          <Link to="/b/$slug" params={{ slug }} aria-label={t('play.exit')}>
            <XIcon />
          </Link>
        </Button>
      </header>
      <div className="h-1 bg-muted" role="progressbar" aria-valuenow={position + 1} aria-valuemin={1} aria-valuemax={playable.length}>
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <main className="flex flex-col items-center justify-center gap-10 p-6">
          <div className="flex items-baseline gap-6 font-mono tabular-nums">
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">{t('play.supply')}</span>
              <span className={cn('text-5xl font-semibold', supply.blocked && 'text-destructive')}>{supply.supply}</span>
            </div>
            {current.step.time !== undefined && (
              <div className="flex flex-col items-center">
                <span className="text-xs tracking-widest text-muted-foreground uppercase">{t('play.at')}</span>
                <span className="text-5xl font-semibold">{formatTime(current.step.time)}</span>
              </div>
            )}
          </div>

          <div className="flex max-w-full flex-col items-center gap-3 text-center" aria-live="polite">
            <ActionLabel actionId={current.step.actionId} label={current.step.label} count={current.step.count} size="lg" />
            {current.step.note && <p className="max-w-xl text-lg text-muted-foreground">{current.step.note}</p>}
          </div>

          {upcoming.length > 0 && (
            <div className="flex flex-col items-center gap-2 opacity-60">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">{t('play.next')}</span>
              {upcoming.map(({ step, index }) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-right font-mono text-muted-foreground">{supplies[index]!.supply}</span>
                  <ActionLabel actionId={step.actionId} label={step.label} count={step.count} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <div className="font-mono text-3xl tabular-nums" aria-label={t('play.clock')}>
              {formatTime(clock.seconds)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-lg" onClick={() => go(-1)} disabled={position === 0} aria-label={t('play.previous')}>
                <ChevronLeftIcon />
              </Button>
              <Button size="lg" onClick={clock.toggle} className="min-w-32">
                {clock.running ? <PauseIcon data-icon="inline-start" /> : <PlayIcon data-icon="inline-start" />}
                {clock.running ? t('play.pause') : clock.seconds > 0 ? t('play.resume') : t('play.start')}
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => go(1)}
                disabled={position === playable.length - 1}
                aria-label={t('play.nextStep')}
              >
                <ChevronRightIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => {
                  clock.reset()
                  setPosition(0)
                }}
                aria-label={t('play.restart')}
              >
                <RotateCcwIcon />
              </Button>
            </div>
            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Kbd>←</Kbd>
              <Kbd>→</Kbd> {t('play.hintSteps')} <Kbd>{t('common.keySpace')}</Kbd> {t('play.hintClock')} <Kbd>R</Kbd> {t('play.hintRestart')}
            </p>
          </div>
        </main>

        <aside ref={listRef} className="hidden overflow-y-auto border-l p-3 lg:block" aria-label={t('play.allSteps')}>
          <StepList
            steps={steps}
            race={race}
            currentIndex={current.index}
            onStepClick={(index) => {
              const pos = playable.findIndex((p) => p.index === index)
              if (pos >= 0) setPosition(pos)
            }}
          />
        </aside>
      </div>
    </div>
  )
}
