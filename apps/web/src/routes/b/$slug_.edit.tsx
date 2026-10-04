import { createFileRoute, redirect } from '@tanstack/react-router'
import { BuildEditor } from '@/components/build-editor/build-editor'
import type { EditorDoc } from '@/components/build-editor/editor-state'
import { NotFound } from '@/components/feedback/not-found'
import { buildQuery } from '@/lib/queries'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/b/$slug_/edit')({
  beforeLoad: requireAuth,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.fetchQuery(buildQuery(params.slug))
    if (!data.isOwner) throw redirect({ to: '/b/$slug', params })
    const { build } = data
    const doc: EditorDoc = {
      meta: {
        title: build.title,
        description: build.description,
        race: build.race,
        vsRace: build.vsRace,
        tags: build.tags,
        patch: build.patch ?? '',
        visibility: build.visibility,
      },
      steps: build.steps,
    }
    return { id: build.id, doc }
  },
  component: EditBuildPage,
  errorComponent: () => <NotFound titleKey="build.notFound" />,
})

function EditBuildPage() {
  const { id, doc } = Route.useLoaderData()
  return <BuildEditor key={id} initialDoc={doc} buildId={id} headingKey="editor.editBuild" draftKey={id} />
}
