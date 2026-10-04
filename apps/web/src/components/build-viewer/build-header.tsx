import { Link } from '@tanstack/react-router'
import { EyeIcon, HeartIcon, ListOrderedIcon } from 'lucide-react'
import { BuildTags } from '@/components/build/build-tags'
import { Matchup } from '@/components/build/race'
import { useI18n } from '@/i18n'
import { useFormat } from '@/lib/format'
import type { BuildDetail } from '@/lib/queries'

export function BuildHeader({ build, actions }: { build: BuildDetail['build']; actions?: React.ReactNode }) {
  const stepCount = build.steps.filter((s) => s.kind === 'step').length
  const { compactNumber, timeAgo } = useFormat()
  const { t, rich } = useI18n()
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Matchup race={build.race} vsRace={build.vsRace} />
        <BuildTags tags={build.tags} />
      </div>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{build.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          {rich('build.by', {
            author: (
              <Link
                to="/u/$username"
                params={{ username: build.author.username }}
                className="font-medium text-foreground hover:text-primary"
              >
                {build.author.displayUsername}
              </Link>
            ),
          })}{' '}
          · {t('build.updated', { time: timeAgo(build.updatedAt) })}
        </span>
        <span className="flex items-center gap-1">
          <ListOrderedIcon className="size-4" aria-hidden="true" />
          {t('common.steps', { count: stepCount })}
        </span>
        <span className="flex items-center gap-1" title={t('common.likes')}>
          <HeartIcon className="size-4" aria-hidden="true" />
          {compactNumber(build.likesCount)}
        </span>
        <span className="flex items-center gap-1" title={t('common.views')}>
          <EyeIcon className="size-4" aria-hidden="true" />
          {compactNumber(build.views)}
        </span>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
