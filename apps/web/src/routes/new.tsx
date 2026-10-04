import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BuildEditor } from '@/components/build-editor/build-editor'
import { type EditorDoc, emptyDoc, newStepId } from '@/components/build-editor/editor-state'
import { buildQuery } from '@/lib/queries'
import { requireAuth } from '@/lib/require-auth'

export const Route = createFileRoute('/new')({
  validateSearch: z.object({ fork: z.string().optional() }),
  beforeLoad: requireAuth,
  loaderDeps: ({ search }) => ({ fork: search.fork }),
  loader: async ({ context, deps }): Promise<EditorDoc> => {
    if (!deps.fork) return emptyDoc()
    const { build } = await context.queryClient.ensureQueryData(buildQuery(deps.fork))
    return {
      meta: {
        title: `${build.title} (copy)`.slice(0, 100),
        description: build.description,
        race: build.race,
        vsRace: build.vsRace,
        tags: build.tags,
        patch: build.patch ?? '',
        visibility: 'public',
      },
      steps: build.steps.map((s) => ({ ...s, id: newStepId() })),
    }
  },
  component: NewBuildPage,
})

function NewBuildPage() {
  const doc = Route.useLoaderData()
  const { fork } = Route.useSearch()
  return <BuildEditor
      key={fork ?? 'new'}
      initialDoc={doc}
      headingKey={fork ? 'editor.forkBuild' : 'editor.newBuild'}
      draftKey={fork ? `fork:${fork}` : 'new'}
    />
}
