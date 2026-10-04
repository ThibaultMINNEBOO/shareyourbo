import { RACE_NAMES, type Race, buildInputSchema, getAction } from '@sybo/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate } from '@tanstack/react-router'
import { EyeIcon, HeadingIcon, ListPlusIcon, PlusIcon, Redo2Icon, SaveIcon, Undo2Icon } from 'lucide-react'
import { useReducer, useRef, useState } from 'react'
import { toast } from 'sonner'
import { StepList } from '@/components/build-viewer/step-list'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api, unwrap } from '@/lib/api'
import { ActionPalette, type PaletteSelection } from './action-palette'
import { type EditorDoc, editorReducer, initEditor, toBuildInput } from './editor-state'
import { MetaForm } from './meta-form'
import { StepTable } from './step-table'

type Props = {
  initialDoc: EditorDoc
  /** Present when editing an existing build. */
  buildId?: string
  heading: string
}

export function BuildEditor({ initialDoc, buildId, heading }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialDoc, initEditor)
  const { doc, selected } = state
  const paletteInput = useRef<HTMLInputElement>(null)
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)
  const [pendingRace, setPendingRace] = useState<Race | null>(null)
  const [titleError, setTitleError] = useState<string>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const dirty = state.past.length > 0
  const save = useMutation({
    mutationFn: (input: ReturnType<typeof toBuildInput>) =>
      buildId
        ? unwrap(api.builds[':id'].$patch({ param: { id: buildId }, json: input }))
        : unwrap(api.builds.$post({ json: input })),
    onSuccess: async ({ slug }) => {
      await queryClient.invalidateQueries({ queryKey: ['builds'] })
      await queryClient.invalidateQueries({ queryKey: ['build', slug] })
      toast.success(buildId ? 'Build updated' : 'Build published')
      navigate({ to: '/b/$slug', params: { slug }, ignoreBlocker: true })
    },
    onError: (error) => toast.error(error.message),
  })

  useBlocker({
    shouldBlockFn: () => dirty && !save.isSuccess && !window.confirm('Leave the editor? Unsaved changes will be lost.'),
    enableBeforeUnload: () => dirty && !save.isSuccess,
  })

  function addFromPalette({ actionId, label, count }: PaletteSelection) {
    dispatch({ type: 'insert', steps: [{ kind: 'step', count, actionId, label }] })
  }

  function addSection() {
    dispatch({ type: 'insert', steps: [{ kind: 'section', count: 1, label: 'New section' }] })
  }

  const foreignSteps = (race: Race) =>
    doc.steps.filter((s) => {
      const action = getAction(s.actionId)
      return action && action.race !== race
    }).length

  function changeRace(race: Race) {
    if (race === doc.meta.race) return
    if (foreignSteps(race) > 0) setPendingRace(race)
    else dispatch({ type: 'meta', patch: { race } })
  }

  function confirmRaceChange() {
    if (!pendingRace) return
    dispatch({
      type: 'set',
      doc: {
        meta: { ...doc.meta, race: pendingRace },
        steps: doc.steps.filter((s) => {
          const action = getAction(s.actionId)
          return !action || action.race === pendingRace
        }),
      },
    })
    setPendingRace(null)
  }

  function submit() {
    const input = toBuildInput(doc)
    const parsed = buildInputSchema.safeParse(input)
    if (!parsed.success) {
      const titleIssue = parsed.error.issues.find((i) => i.path[0] === 'title')
      setTitleError(titleIssue ? 'Give your build a title (3 characters minimum)' : undefined)
      const stepsIssue = parsed.error.issues.find((i) => i.path[0] === 'steps')
      toast.error(titleIssue ? 'Your build needs a title' : stepsIssue ? 'Add at least one step' : parsed.error.issues[0]!.message)
      return
    }
    setTitleError(undefined)
    save.mutate(input)
  }

  const palette = (
    <ActionPalette race={doc.meta.race} onPick={addFromPalette} inputRef={paletteInput} listClassName="max-h-[60vh]" />
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
      <div className="sticky top-14 z-30 -mx-4 flex items-center gap-2 border-b bg-background/90 px-4 py-2 backdrop-blur">
        <h1 className="font-heading text-lg font-semibold">{heading}</h1>
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'undo' })} disabled={!state.past.length} aria-label="Undo">
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'redo' })} disabled={!state.future.length} aria-label="Redo">
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
          </Tooltip>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
            {buildId ? 'Save' : 'Publish'}
          </Button>
        </div>
      </div>

      <MetaForm
        meta={doc.meta}
        onChange={(patch) => {
          if (patch.title) setTitleError(undefined)
          dispatch({ type: 'meta', patch })
        }}
        onRaceChange={changeRace}
        titleError={titleError}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex flex-col gap-3" aria-label="Steps">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold">Steps</h2>
            <span className="text-sm text-muted-foreground">{doc.steps.filter((s) => s.kind === 'step').length}</span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={addSection}>
              <HeadingIcon data-icon="inline-start" />
              Section
            </Button>
          </div>
          <StepTable steps={doc.steps} race={doc.meta.race} selected={selected} dispatch={dispatch} />
        </section>

        <aside className="sticky top-32 hidden lg:block">
          <Tabs defaultValue="add">
            <TabsList className="w-full">
              <TabsTrigger value="add">
                <ListPlusIcon /> Add steps
              </TabsTrigger>
              <TabsTrigger value="preview">
                <EyeIcon /> Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="add">{palette}</TabsContent>
            <TabsContent value="preview">
              <Card className="py-3">
                <CardContent className="max-h-[70vh] overflow-y-auto px-2">
                  {doc.steps.length ? (
                    <StepList steps={doc.steps} race={doc.meta.race} />
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <Button
        size="lg"
        className="fixed right-4 bottom-4 z-30 rounded-full shadow-lg lg:hidden"
        onClick={() => setPaletteSheetOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Add step
      </Button>
      <Sheet open={paletteSheetOpen} onOpenChange={setPaletteSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85svh]">
          <SheetHeader>
            <SheetTitle>Add a step</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ActionPalette race={doc.meta.race} onPick={addFromPalette} listClassName="max-h-[55svh]" />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingRace} onOpenChange={(open) => !open && setPendingRace(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {pendingRace && RACE_NAMES[pendingRace]}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRace && foreignSteps(pendingRace)} step(s) use {RACE_NAMES[doc.meta.race]} actions and will be removed. Text
              steps and sections are kept. You can undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRaceChange}>Switch race</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
