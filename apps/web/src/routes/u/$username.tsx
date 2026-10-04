import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { PlusIcon, ScrollTextIcon } from 'lucide-react'
import { BuildCard, BuildGrid } from '@/components/browse/build-card'
import { NotFound } from '@/components/feedback/not-found'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useFormat } from '@/lib/format'
import { userQuery } from '@/lib/queries'

export const Route = createFileRoute('/u/$username')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(userQuery(params.username)),
  component: ProfilePage,
  errorComponent: () => <NotFound title="Player not found" />,
})

function ProfilePage() {
  const { username } = Route.useParams()
  const { data } = useSuspenseQuery(userQuery(username))
  const { user, builds, isSelf } = data
  const { formatDate } = useFormat()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="font-heading text-xl font-bold uppercase">{user.displayUsername.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{user.displayUsername}</h1>
          <p className="text-sm text-muted-foreground">
            {builds.length} build{builds.length === 1 ? '' : 's'} · joined {formatDate(user.createdAt)}
          </p>
        </div>
        {isSelf && (
          <Button className="ml-auto" asChild>
            <Link to="/new">
              <PlusIcon data-icon="inline-start" />
              New build
            </Link>
          </Button>
        )}
      </header>

      {builds.length ? (
        <BuildGrid>
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} showAuthor={false} />
          ))}
        </BuildGrid>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollTextIcon />
            </EmptyMedia>
            <EmptyTitle>No builds yet</EmptyTitle>
            <EmptyDescription>
              {isSelf ? 'Your published builds will show up here.' : `${user.displayUsername} hasn't shared a build yet.`}
            </EmptyDescription>
          </EmptyHeader>
          {isSelf && (
            <EmptyContent>
              <Button asChild>
                <Link to="/new">Create your first build</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </div>
  )
}
