import { Link } from '@tanstack/react-router'
import { HeartIcon, ListOrderedIcon } from 'lucide-react'
import { ActionBadge } from '@/components/build/action-chip'
import { BuildTags } from '@/components/build/build-tags'
import { Matchup } from '@/components/build/race'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import type { BuildSummary } from '@/lib/queries'
import { getAction } from '@sybo/shared'

/** Card with the first steps of the build as an "opener" strip. */
export function BuildCard({ build, showAuthor = true }: { build: BuildSummary; showAuthor?: boolean }) {
  const { compactNumber, timeAgo } = useFormat()
  return (
    <Card className="group relative gap-4 transition-colors hover:border-primary/50 hover:bg-card/80">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <Matchup race={build.race} vsRace={build.vsRace} />
          {build.visibility !== 'public' && (
            <span className="text-xs text-muted-foreground capitalize">{build.visibility}</span>
          )}
        </div>
        <CardTitle className="font-heading text-lg leading-snug">
          <Link
            to="/b/$slug"
            params={{ slug: build.slug }}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {build.title}
          </Link>
        </CardTitle>
        {showAuthor && (
          <CardDescription>
            by {build.author.displayUsername} · {timeAgo(build.updatedAt)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ol className="flex flex-wrap gap-1.5" aria-label="Opening steps">
          {build.preview.map((step) => {
            const action = getAction(step.actionId)
            return (
              <li key={step.id} title={action?.name ?? step.label}>
                {action ? (
                  <ActionBadge short={action.short} race={action.race} />
                ) : (
                  <span className="inline-flex h-6 max-w-28 items-center truncate rounded border border-dashed px-1.5 text-xs text-muted-foreground">
                    {step.label}
                  </span>
                )}
              </li>
            )
          })}
          {build.stepCount > build.preview.length && (
            <li className="inline-flex h-6 items-center px-1 text-xs text-muted-foreground">
              +{build.stepCount - build.preview.length}
            </li>
          )}
        </ol>
        <BuildTags tags={build.tags} />
      </CardContent>
      <CardFooter className="mt-auto gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <HeartIcon className="size-4" aria-hidden="true" />
          {compactNumber(build.likesCount)}
          <span className="sr-only">likes</span>
        </span>
        <span className="flex items-center gap-1">
          <ListOrderedIcon className="size-4" aria-hidden="true" />
          {build.stepCount}
          <span className="sr-only">steps</span>
        </span>
      </CardFooter>
    </Card>
  )
}

export function BuildGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
