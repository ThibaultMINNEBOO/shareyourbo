import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlayMode } from '@/components/build-viewer/play-mode'
import { NotFound } from '@/components/feedback/not-found'
import { buildQuery } from '@/lib/queries'

export const Route = createFileRoute('/b/$slug_/play')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(buildQuery(params.slug)),
  component: PlayPage,
  errorComponent: () => <NotFound titleKey="build.notFound" />,
})

function PlayPage() {
  const { slug } = Route.useParams()
  const { build } = useSuspenseQuery(buildQuery(slug)).data
  return <PlayMode slug={slug} title={build.title} race={build.race} vsRace={build.vsRace} steps={build.steps} />
}
