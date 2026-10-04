import { BUILD_TAGS, OPPONENT_RACES, RACES } from '@sybo/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { PlusIcon, SwordsIcon } from 'lucide-react'
import { useCallback } from 'react'
import { z } from 'zod'
import { BuildCard, BuildGrid } from '@/components/browse/build-card'
import { BuildCardSkeleton } from '@/components/browse/build-card-skeleton'
import { type BrowseFilters, BuildFilters } from '@/components/browse/build-filters'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n'
import { buildListQuery } from '@/lib/queries'

const searchSchema = z.object({
  race: z.enum(RACES).optional().catch(undefined),
  vs: z.enum(OPPONENT_RACES).optional().catch(undefined),
  tag: z.enum(BUILD_TAGS).optional().catch(undefined),
  q: z.string().max(100).optional().catch(undefined),
  sort: z.enum(['new', 'top']).default('new').catch('new'),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: HomePage,
})

function HomePage() {
  const filters = Route.useSearch()
  const navigate = Route.useNavigate()
  const list = useInfiniteQuery(buildListQuery(filters))
  const { t } = useI18n()
  const builds = list.data?.pages.flatMap((p) => p.items) ?? []

  const onChange = useCallback(
    (patch: Partial<BrowseFilters>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {t('home.titleLine1')}
          <br />
          <span className="text-primary">{t('home.titleLine2')}</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('home.intro')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" asChild>
            <Link to="/new">
              <PlusIcon data-icon="inline-start" />
              {t('home.createBuild')}
            </Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-label={t('home.buildsSection')}>
        <BuildFilters filters={filters} onChange={onChange} />

        {list.isPending ? (
          <BuildGrid>
            {Array.from({ length: 6 }, (_, i) => (
              <BuildCardSkeleton key={i} />
            ))}
          </BuildGrid>
        ) : list.isError ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t('home.loadError')}</EmptyTitle>
              <EmptyDescription>{list.error.message}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => list.refetch()}>
                {t('common.tryAgain')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : builds.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SwordsIcon />
              </EmptyMedia>
              <EmptyTitle>{t('home.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('home.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/new">{t('home.createBuild')}</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <BuildGrid>
              {builds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </BuildGrid>
            {list.hasNextPage && (
              <Button
                variant="outline"
                className="self-center"
                onClick={() => list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
              >
                {list.isFetchingNextPage && <Spinner data-icon="inline-start" />}
                {t('home.loadMore')}
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
