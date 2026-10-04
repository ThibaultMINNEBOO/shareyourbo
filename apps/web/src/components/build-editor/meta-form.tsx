import {
  BUILD_TAGS,
  type BuildTag,
  OPPONENT_RACES,
  type OpponentRace,
  RACES,
  type Race,
  type Visibility,
} from '@sybo/shared'
import { cn } from 'cn'
import { raceClasses } from '@/components/build/race'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useI18n } from '@/i18n'
import { CommitInput } from './commit-input'
import type { EditorMeta } from './editor-state'

type Props = {
  meta: EditorMeta
  onChange: (patch: Partial<EditorMeta>) => void
  onRaceChange: (race: Race) => void
  titleError?: string
}

const VISIBILITY_KEYS = {
  public: 'editor.meta.visibilityPublic',
  unlisted: 'editor.meta.visibilityUnlisted',
  private: 'editor.meta.visibilityPrivate',
} as const satisfies Record<Visibility, string>

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
  const { t } = useI18n()
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
          aria-label={t(`races.${race}`)}
          title={t(`races.${race}`)}
          className={cn('w-10 font-heading font-bold', raceClasses[race].on)}
        >
          {race}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function MetaForm({ meta, onChange, onRaceChange, titleError }: Props) {
  const { t } = useI18n()
  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={!!titleError || undefined}>
        <FieldLabel htmlFor="build-title" className="sr-only">
          {t('editor.meta.title')}
        </FieldLabel>
        <CommitInput
          id="build-title"
          value={meta.title}
          onCommit={(title) => onChange({ title })}
          placeholder={t('editor.meta.titlePlaceholder')}
          maxLength={100}
          aria-invalid={!!titleError}
          className="h-12 border-input px-3 font-heading text-xl font-semibold md:text-2xl dark:bg-input/30"
        />
        <FieldError>{titleError}</FieldError>
      </Field>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field className="w-auto">
          <FieldLabel>{t('editor.meta.race')}</FieldLabel>
          <RaceToggle races={RACES} value={meta.race} onChange={onRaceChange} label={t('editor.meta.yourRace')} />
        </Field>
        <Field className="w-auto">
          <FieldLabel>{t('editor.meta.versus')}</FieldLabel>
          <RaceToggle races={OPPONENT_RACES} value={meta.vsRace} onChange={(vsRace) => onChange({ vsRace })} label={t('editor.meta.opponentRace')} />
        </Field>
        <Field className="w-28">
          <FieldLabel htmlFor="build-patch">{t('editor.meta.patch')}</FieldLabel>
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
          <FieldLabel htmlFor="build-visibility">{t('editor.meta.visibility')}</FieldLabel>
          <Select value={meta.visibility} onValueChange={(v) => onChange({ visibility: v as Visibility })}>
            <SelectTrigger id="build-visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.keys(VISIBILITY_KEYS) as Visibility[]).map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(VISIBILITY_KEYS[v])}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>{t('editor.meta.tags')}</FieldLabel>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={meta.tags}
          onValueChange={(tags) => tags.length <= 4 && onChange({ tags: tags as BuildTag[] })}
          className="flex-wrap"
          aria-label={t('editor.meta.tags')}
        >
          {BUILD_TAGS.map((tag) => (
            <ToggleGroupItem key={tag} value={tag} className="data-[state=on]:border-primary/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">
              {t(`tags.${tag}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel htmlFor="build-description">{t('editor.meta.description')}</FieldLabel>
        <Textarea
          key={meta.description}
          id="build-description"
          defaultValue={meta.description}
          onBlur={(e) => e.target.value !== meta.description && onChange({ description: e.target.value })}
          placeholder={t('editor.meta.descriptionPlaceholder')}
          maxLength={2000}
          rows={3}
        />
      </Field>
    </FieldGroup>
  )
}
