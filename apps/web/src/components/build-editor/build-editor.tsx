import { type Race, type Step, buildInputSchema, getAction } from '@sybo/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate } from '@tanstack/react-router'
import { EyeIcon, HeadingIcon, HistoryIcon, ListPlusIcon, PlusIcon, Redo2Icon, SaveIcon, Undo2Icon } from 'lucide-react'
import { useReducer, useRef, useState } from 'react'
import { toast } from 'sonner'
import { StepList } from '@/components/build-viewer/step-list'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { type TextKey, useI18n } from '@/i18n'
import { api, unwrap } from '@/lib/api'
import { useFormat } from '@/lib/format'
import { ActionPalette, type PaletteSelection } from './action-palette'
import { type EditorDoc, editorReducer, initEditor, newStepId, toBuildInput } from './editor-state'
import { ImportDialog } from './import-dialog'
import { MetaForm } from './meta-form'
import { StepTable } from './step-table'
import { clearDraft, useDraft } from './use-draft'
import { useEditorShortcuts } from './use-editor-shortcuts'

type Props = {
  initialDoc: EditorDoc
  /** Present when editing an existing build. */
  buildId?: string
  headingKey: TextKey
  /** localStorage key for the unsaved draft of this editor session. */
  draftKey: string
}

export function BuildEditor({ initialDoc, buildId, headingKey, draftKey }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialDoc, initEditor)
  const { doc, selected } = state
  const paletteInput = useRef<HTMLInputElement>(null)
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)
  const [pendingRace, setPendingRace] = useState<Race | null>(null)
  const [titleError, setTitleError] = useState<string>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { timeAgo } = useFormat()
  const { t } = useI18n()

  const dirty = state.past.length > 0
  const save = useMutation({
    mutationFn: (input: ReturnType<typeof toBuildInput>) =>
      buildId
        ? unwrap(api.builds[':id'].$patch({ param: { id: buildId }, json: input }))
        : unwrap(api.builds.$post({ json: input })),
    onSuccess: async ({ slug }) => {
      clearDraft(draftKey)
      await queryClient.invalidateQueries({ queryKey: ['builds'] })
      await queryClient.invalidateQueries({ queryKey: ['build', slug] })
      toast.success(buildId ? t('editor.updated') : t('editor.published'))
      navigate({ to: '/b/$slug', params: { slug }, ignoreBlocker: true })
    },
    onError: (error) => toast.error(error.message),
  })

  const draft = useDraft(draftKey, doc, dirty)

  function focusPalette() {
    const input = paletteInput.current
    if (input && input.offsetParent !== null) input.focus()
    else setPaletteSheetOpen(true)
  }

  useEditorShortcuts(state, dispatch, focusPalette)

  useBlocker({
    shouldBlockFn: () => dirty && !save.isSuccess && !window.confirm(t('editor.leaveConfirm')),
    enableBeforeUnload: () => dirty && !save.isSuccess,
  })

  function addFromPalette({ actionId, label, count }: PaletteSelection) {
    dispatch({ type: 'insert', steps: [{ kind: 'step', count, actionId, label }] })
  }

  function addSection() {
    dispatch({ type: 'insert', steps: [{ kind: 'section', count: 1, label: t('editor.newSection') }] })
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
      setTitleError(titleIssue ? t('editor.titleError') : undefined)
      const stepsIssue = parsed.error.issues.find((i) => i.path[0] === 'steps')
      toast.error(titleIssue ? t('editor.needTitle') : stepsIssue ? t('editor.needSteps') : t('editor.invalid'))
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
        <h1 className="font-heading text-lg font-semibold">{t(headingKey)}</h1>
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'undo' })} disabled={!state.past.length} aria-label={t('editor.undo')}>
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('editor.undo')} (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'redo' })} disabled={!state.future.length} aria-label={t('editor.redo')}>
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('editor.redo')} (⌘⇧Z)</TooltipContent>
          </Tooltip>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
            {buildId ? t('editor.save') : t('editor.publish')}
          </Button>
        </div>
      </div>

      {draft.draft && (
        <Alert>
          <HistoryIcon />
          <AlertTitle>{t('editor.draftTitle')}</AlertTitle>
          <AlertDescription>
            {t('editor.draftDescription', { time: timeAgo(new Date(draft.draft.savedAt)) })}
          </AlertDescription>
          <AlertAction className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={draft.dismiss}>
              {t('editor.discard')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                dispatch({ type: 'set', doc: draft.draft!.doc })
                draft.consume()
              }}
            >
              {t('editor.restore')}
            </Button>
          </AlertAction>
        </Alert>
      )}

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
        <section className="flex flex-col gap-3" aria-label={t('editor.steps')}>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold">{t('editor.steps')}</h2>
            <span className="text-sm text-muted-foreground">{doc.steps.filter((s) => s.kind === 'step').length}</span>
            <div className="ml-auto" />
            <ImportDialog
              race={doc.meta.race}
              hasSteps={doc.steps.length > 0}
              onImport={(steps, race) => {
                if (race) {
                  dispatch({
                    type: 'set',
                    doc: { meta: { ...doc.meta, race }, steps: steps.map((s) => ({ ...s, id: newStepId() }) as Step) },
                  })
                } else {
                  dispatch({ type: 'insert', at: doc.steps.length, steps })
                }
                toast.success(t('editor.imported', { count: steps.length }))
              }}
            />
            <Button variant="outline" size="sm" onClick={addSection}>
              <HeadingIcon data-icon="inline-start" />
              {t('editor.section')}
            </Button>
          </div>
          <StepTable steps={doc.steps} race={doc.meta.race} selected={selected} dispatch={dispatch} />
        </section>

        <aside className="sticky top-32 hidden lg:block">
          <Tabs defaultValue="add">
            <TabsList className="w-full">
              <TabsTrigger value="add">
                <ListPlusIcon /> {t('editor.addSteps')}
              </TabsTrigger>
              <TabsTrigger value="preview">
                <EyeIcon /> {t('editor.preview')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="add">{palette}</TabsContent>
            <TabsContent value="preview">
              <Card className="py-3">
                <CardContent className="max-h-[70vh] overflow-y-auto px-2">
                  {doc.steps.length ? (
                    <StepList steps={doc.steps} race={doc.meta.race} />
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">{t('editor.nothingToPreview')}</p>
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
        {t('editor.addStep')}
      </Button>
      <Sheet open={paletteSheetOpen} onOpenChange={setPaletteSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85svh]">
          <SheetHeader>
            <SheetTitle>{t('editor.addStep')}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ActionPalette race={doc.meta.race} onPick={addFromPalette} listClassName="max-h-[55svh]" />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingRace} onOpenChange={(open) => !open && setPendingRace(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingRace && t('editor.raceSwitchTitle', { race: t(`races.${pendingRace}`) })}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRace &&
                t('editor.raceSwitchDescription', {
                  count: foreignSteps(pendingRace),
                  race: t(`races.${doc.meta.race}`),
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRaceChange}>{t('editor.raceSwitchConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
