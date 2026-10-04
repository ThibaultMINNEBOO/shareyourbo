import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api, unwrap } from '@/lib/api'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => unwrap(api.health.$get()),
  })
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">ShareYourBO</h1>
      <p className="text-muted-foreground">API: {health.data?.ok ? 'up' : '…'}</p>
    </main>
  )
}
