import {
  BUILD_TAGS,
  type BuildTag,
  OPPONENT_RACES,
  type OpponentRace,
  RACES,
  RACE_NAMES,
  type Race,
  type Visibility,
} from '@sybo/shared'
import { cn } from 'cn'
import { raceClasses } from '@/components/build/race'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CommitInput } from './commit-input'
import type { EditorMeta } from './editor-state'

type Props = {
  meta: EditorMeta
  onChange: (patch: Partial<EditorMeta>) => void
  onRaceChange: (race: Race) => void
  titleError?: string
}

const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: 'Public — listed on ShareYourBO',
  unlisted: 'Unlisted — only people with the link',
  private: 'Private — only you',
}

function RaceToggle<R extends OpponentRace>({
  races,
  value,
  onChange,
  label,
}: {
  races: readonly R[]
  value: R
  onChange: (race: R) => void
  label: string
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={0}
      value={value}
      onValueChange={(v) => v && onChange(v as R)}
      aria-label={label}
    >
      {races.map((race) => (
        <ToggleGroupItem
          key={race}
          value={race}
          aria-label={RACE_NAMES[race]}
          title={RACE_NAMES[race]}
          className={cn('w-10 font-heading font-bold', raceClasses[race].on)}
        >
          {race}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function MetaForm({ meta, onChange, onRaceChange, titleError }: Props) {
  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={!!titleError || undefined}>
        <FieldLabel htmlFor="build-title" className="sr-only">
          Title
        </FieldLabel>
        <CommitInput
          id="build-title"
          value={meta.title}
          onCommit={(title) => onChange({ title })}
          placeholder="Name your build — e.g. “2 Base Blink into Charge”"
          maxLength={100}
          aria-invalid={!!titleError}
          className="h-12 border-input px-3 font-heading text-xl font-semibold md:text-2xl dark:bg-input/30"
        />
        <FieldError>{titleError}</FieldError>
      </Field>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field className="w-auto">
          <FieldLabel>Race</FieldLabel>
          <RaceToggle races={RACES} value={meta.race} onChange={onRaceChange} label="Your race" />
        </Field>
        <Field className="w-auto">
          <FieldLabel>Versus</FieldLabel>
          <RaceToggle races={OPPONENT_RACES} value={meta.vsRace} onChange={(vsRace) => onChange({ vsRace })} label="Opponent race" />
        </Field>
        <Field className="w-28">
          <FieldLabel htmlFor="build-patch">Patch</FieldLabel>
          <CommitInput
            id="build-patch"
            value={meta.patch}
            onCommit={(patch) => onChange({ patch })}
            placeholder="5.0.14"
            maxLength={16}
            className="border-input dark:bg-input/30"
          />
        </Field>
        <Field className="w-auto min-w-64">
          <FieldLabel htmlFor="build-visibility">Visibility</FieldLabel>
          <Select value={meta.visibility} onValueChange={(v) => onChange({ visibility: v as Visibility })}>
            <SelectTrigger id="build-visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.keys(VISIBILITY_LABELS) as Visibility[]).map((v) => (
                  <SelectItem key={v} value={v}>
                    {VISIBILITY_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>Tags (up to 4)</FieldLabel>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={meta.tags}
          onValueChange={(tags) => tags.length <= 4 && onChange({ tags: tags as BuildTag[] })}
          className="flex-wrap"
          aria-label="Tags"
        >
          {BUILD_TAGS.map((tag) => (
            <ToggleGroupItem key={tag} value={tag} className="capitalize data-[state=on]:border-primary/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">
              {tag}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="build-description">Description</FieldLabel>
        <Textarea
          key={meta.description}
          id="build-description"
          defaultValue={meta.description}
          onBlur={(e) => e.target.value !== meta.description && onChange({ description: e.target.value })}
          placeholder="When to use it, what to scout for, how to transition…"
          maxLength={2000}
          rows={3}
        />
      </Field>
    </FieldGroup>
  )
}
