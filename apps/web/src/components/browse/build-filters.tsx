import { BUILD_TAGS, type BuildTag, OPPONENT_RACES, type OpponentRace, RACES, type Race } from '@sybo/shared'
import { cn } from 'cn'
import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { raceClasses } from '@/components/build/race'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useI18n } from '@/i18n'

export type BrowseFilters = {
  race?: Race
  vs?: OpponentRace
  tag?: BuildTag
  q?: string
  sort: 'new' | 'top'
}

type Props = { filters: BrowseFilters; onChange: (patch: Partial<BrowseFilters>) => void }

const ALL = 'all'

function RaceFilter<R extends OpponentRace>({
  label,
  races,
  value,
  onChange,
}: {
  label: string
  races: readonly R[]
  value?: R
  onChange: (race: R | undefined) => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={value ?? ALL}
        onValueChange={(v) => onChange(v && v !== ALL ? (v as R) : undefined)}
        aria-label={label}
      >
        <ToggleGroupItem value={ALL} className="px-2.5">
          {t('filters.all')}
        </ToggleGroupItem>
        {races.map((race) => (
          <ToggleGroupItem
            key={race}
            value={race}
            aria-label={t(`races.${race}`)}
            title={t(`races.${race}`)}
            className={cn('w-8 font-heading font-bold', raceClasses[race].on)}
          >
            {race}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export function BuildFilters({ filters, onChange }: Props) {
  const [query, setQuery] = useState(filters.q ?? '')
  const { t } = useI18n()

  useEffect(() => {
    if ((filters.q ?? '') === query) return
    const timer = setTimeout(() => onChange({ q: query.trim() || undefined }), 300)
    return () => clearTimeout(timer)
  }, [query, filters.q, onChange])

  const hasFilters = !!(filters.race || filters.vs || filters.tag || filters.q)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="max-w-sm min-w-56 flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('filters.search')}
            aria-label={t('filters.search')}
            type="search"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label={t('filters.clearSearch')} onClick={() => setQuery('')}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <Select value={filters.tag ?? ALL} onValueChange={(v) => onChange({ tag: v === ALL ? undefined : (v as BuildTag) })}>
          <SelectTrigger className="w-40" aria-label={t('filters.style')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>{t('filters.allStyles')}</SelectItem>
              {BUILD_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {t(`tags.${tag}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={filters.sort}
          onValueChange={(v) => v && onChange({ sort: v as BrowseFilters['sort'] })}
          aria-label={t('filters.sort')}
          className="ml-auto"
        >
          <ToggleGroupItem value="new" className="px-3">
            {t('filters.newest')}
          </ToggleGroupItem>
          <ToggleGroupItem value="top" className="px-3">
            {t('filters.mostLiked')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <RaceFilter label={t('filters.race')} races={RACES} value={filters.race} onChange={(race) => onChange({ race })} />
        <RaceFilter label={t('filters.vs')} races={OPPONENT_RACES} value={filters.vs} onChange={(vs) => onChange({ vs })} />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              onChange({ race: undefined, vs: undefined, tag: undefined, q: undefined })
            }}
          >
            <XIcon data-icon="inline-start" />
            {t('filters.clear')}
          </Button>
        )}
      </div>
    </div>
  )
}
