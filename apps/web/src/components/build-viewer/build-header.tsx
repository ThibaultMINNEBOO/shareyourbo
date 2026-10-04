import { Link } from '@tanstack/react-router'
import { EyeIcon, HeartIcon, ListOrderedIcon } from 'lucide-react'
import { BuildTags } from '@/components/build/build-tags'
import { Matchup } from '@/components/build/race'
import { compactNumber, timeAgo } from '@/lib/format'
import type { BuildDetail } from '@/lib/queries'

export function BuildHeader({ build, actions }: { build: BuildDetail['build']; actions?: React.ReactNode }) {
  const stepCount = build.steps.filter((s) => s.kind === 'step').length
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Matchup race={build.race} vsRace={build.vsRace} />
        <BuildTags tags={build.tags} />
      </div>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{build.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          by{' '}
          <Link
            to="/u/$username"
            params={{ username: build.author.username }}
            className="font-medium text-foreground hover:text-primary"
          >
            {build.author.displayUsername}
          </Link>{' '}
          · updated {timeAgo(build.updatedAt)}
        </span>
        <span className="flex items-center gap-1" title="Steps">
          <ListOrderedIcon className="size-4" aria-hidden="true" />
          {stepCount} steps
        </span>
        <span className="flex items-center gap-1" title="Likes">
          <HeartIcon className="size-4" aria-hidden="true" />
          {compactNumber(build.likesCount)}
        </span>
        <span className="flex items-center gap-1" title="Views">
          <EyeIcon className="size-4" aria-hidden="true" />
          {compactNumber(build.views)}
        </span>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
