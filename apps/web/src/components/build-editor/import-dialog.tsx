import { type ImportedStep, RACE_NAMES, type Race, parseBuildText } from '@sybo/shared'
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

const PLACEHOLDER = `13  0:12  Overlord
16  0:48  Hatchery
18  1:01  Extractor
17  1:08  Spawning Pool`

type Props = {
  race: Race
  hasSteps: boolean
  /** `race` is set when the build is empty and the pasted build is for another race. */
  onImport: (steps: ImportedStep[], race?: Race) => void
}

export function ImportDialog({ race, hasSteps, onImport }: Props) {
  const [open, setOpen] = useState(false)
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
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import a build</DialogTitle>
          <DialogDescription>
            Paste a build copied from Spawning Tool, Liquipedia or a notepad. One step per line.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="import-text" className="sr-only">
            Build text
          </FieldLabel>
          <Textarea
            id="import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            className="font-mono text-sm"
            autoFocus
          />
          <FieldDescription>
            {count === 0
              ? 'Supply and time are optional: “14 0:18 Pylon”, “Queen x2”, “# Opening” for sections.'
              : `${count} step${count === 1 ? '' : 's'} found${result.unmatched ? ` · ${result.unmatched} kept as text` : ''}${
                  result.race ? ` · ${RACE_NAMES[result.race]}` : ''
                }`}
          </FieldDescription>
        </Field>
        {otherRace && hasSteps && (
          <Alert>
            <AlertDescription>
              This looks like a {RACE_NAMES[otherRace]} build but yours is {RACE_NAMES[race]}. Steps will be added
              anyway.
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={result.steps.length === 0}>
            Add {count || ''} step{count === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
