import { type ImportedStep, type Race, parseBuildText } from '@sybo/shared'
import { ClipboardPasteIcon } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'

type Props = {
  race: Race
  hasSteps: boolean
  /** `race` is set when the build is empty and the pasted build is for another race. */
  onImport: (steps: ImportedStep[], race?: Race) => void
}

export function ImportDialog({ race, hasSteps, onImport }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const [text, setText] = useState('')
  const deferred = useDeferredValue(text)
  const result = useMemo(() => parseBuildText(deferred, race), [deferred, race])
  const count = result.steps.filter((s) => s.kind === 'step').length
  const otherRace = result.race && result.race !== race ? result.race : undefined

  function submit() {
    onImport(result.steps, !hasSteps ? otherRace : undefined)
    setText('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ClipboardPasteIcon data-icon="inline-start" />
          {t('editor.import.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('editor.import.title')}</DialogTitle>
          <DialogDescription>{t('editor.import.description')}</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="import-text" className="sr-only">
            {t('editor.import.label')}
          </FieldLabel>
          <Textarea
            id="import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('editor.import.placeholder')}
            rows={10}
            className="font-mono text-sm"
            autoFocus
          />
          <FieldDescription>
            {count === 0
              ? t('editor.import.hint')
              : [
                  t('editor.import.found', { count }),
                  result.unmatched ? t('editor.import.keptAsText', { count: result.unmatched }) : null,
                  result.race ? t(`races.${result.race}`) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
          </FieldDescription>
        </Field>
        {otherRace && hasSteps && (
          <Alert>
            <AlertDescription>
              {t('editor.import.otherRace', { other: t(`races.${otherRace}`), race: t(`races.${race}`) })}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={result.steps.length === 0}>
            {t('editor.import.submit', { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
