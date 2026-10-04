import { BUILD_TAGS, type BuildTag, OPPONENT_RACES, type OpponentRace, RACES, RACE_NAMES, type Race } from '@sybo/shared'
import { cn } from 'cn'
import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { raceClasses } from '@/components/build/race'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
          All
        </ToggleGroupItem>
        {races.map((race) => (
          <ToggleGroupItem
            key={race}
            value={race}
            aria-label={RACE_NAMES[race]}
            title={RACE_NAMES[race]}
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
            placeholder="Search builds…"
            aria-label="Search builds"
            type="search"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery('')}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <Select value={filters.tag ?? ALL} onValueChange={(v) => onChange({ tag: v === ALL ? undefined : (v as BuildTag) })}>
          <SelectTrigger className="w-36 capitalize" aria-label="Tag">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>All styles</SelectItem>
              {BUILD_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag} className="capitalize">
                  {tag}
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
          aria-label="Sort"
          className="ml-auto"
        >
          <ToggleGroupItem value="new" className="px-3">
            Newest
          </ToggleGroupItem>
          <ToggleGroupItem value="top" className="px-3">
            Most liked
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <RaceFilter label="Race" races={RACES} value={filters.race} onChange={(race) => onChange({ race })} />
        <RaceFilter label="vs" races={OPPONENT_RACES} value={filters.vs} onChange={(vs) => onChange({ vs })} />
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
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
