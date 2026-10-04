import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/u/$username')({
  component: ProfilePage,
})

function ProfilePage() {
  const { username } = Route.useParams()
  return <div className="mx-auto w-full max-w-6xl px-4 py-8">Builds by {username}</div>
}
