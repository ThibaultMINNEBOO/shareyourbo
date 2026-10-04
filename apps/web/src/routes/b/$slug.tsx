import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { GitForkIcon, PencilIcon, PlayIcon } from 'lucide-react'
import { BuildHeader } from '@/components/build-viewer/build-header'
import { CopyActions } from '@/components/build-viewer/copy-actions'
import { LikeButton } from '@/components/build-viewer/like-button'
import { StepList } from '@/components/build-viewer/step-list'
import { NotFound } from '@/components/feedback/not-found'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { useFormat } from '@/lib/format'
import { buildQuery } from '@/lib/queries'

export const Route = createFileRoute('/b/$slug')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(buildQuery(params.slug)),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.build.title} — ShareYourBO` : 'ShareYourBO' }] }),
  component: BuildPage,
  errorComponent: () => (
    <NotFound titleKey="build.notFound" descriptionKey="build.notFoundDescription" />
  ),
})

function BuildPage() {
  const { slug } = Route.useParams()
  const { data } = useSuspenseQuery(buildQuery(slug))
  const { build } = data
  const { formatDate } = useFormat()
  const { t } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <BuildHeader
        build={build}
        actions={
          <>
            <Button asChild>
              <Link to="/b/$slug/play" params={{ slug }}>
                <PlayIcon data-icon="inline-start" />
                {t('build.playMode')}
              </Link>
            </Button>
            <LikeButton slug={slug} data={data} />
            {data.isOwner && (
              <Button variant="outline" asChild>
                <Link to="/b/$slug/edit" params={{ slug }}>
                  <PencilIcon data-icon="inline-start" />
                  {t('build.edit')}
                </Link>
              </Button>
            )}
            <CopyActions title={build.title} steps={build.steps} />
            <Button variant="outline" asChild>
              <Link to="/new" search={{ fork: slug }}>
                <GitForkIcon data-icon="inline-start" />
                {t('build.fork')}
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="py-4">
          <CardContent className="px-2 sm:px-4">
            <StepList steps={build.steps} race={build.race} />
          </CardContent>
        </Card>
        <aside className="flex flex-col gap-4">
          {build.description && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">{t('build.about')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {build.description}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Detail label={t('build.matchup')} value={`${t(`races.${build.race}`)} ${t('common.vs')} ${t(`races.${build.vsRace}`)}`} />
              <Separator />
              {build.patch && (
                <>
                  <Detail label={t('build.patch')} value={build.patch} />
                  <Separator />
                </>
              )}
              <Detail label={t('build.created')} value={formatDate(build.createdAt)} />
              {build.visibility !== 'public' && (
                <>
                  <Separator />
                  <Detail label={t('build.visibility')} value={t(`visibility.${build.visibility}`)} />
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
