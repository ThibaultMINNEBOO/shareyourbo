import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/new')({
  beforeLoad: requireAuth,
  component: NewBuildPage,
})

function NewBuildPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 py-8">Editor coming soon.</div>
}
