import { type Race, type Step, computeSupply } from '@sybo/shared'
import { ListPlusIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Kbd } from '@/components/ui/kbd'
import type { EditorAction } from './editor-state'
import { StepRow } from './step-row'

type Props = {
  steps: Step[]
  race: Race
  selected: number
  dispatch: React.Dispatch<EditorAction>
}

export function StepTable({ steps, race, selected, dispatch }: Props) {
  const supplies = useMemo(() => computeSupply(race, steps), [race, steps])

  if (!steps.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListPlusIcon />
          </EmptyMedia>
          <EmptyTitle>No steps yet</EmptyTitle>
          <EmptyDescription>
            Pick actions from the palette, or press <Kbd>/</Kbd> and type: <span className="font-mono">2 probe</span>{' '}
            <Kbd>⏎</Kbd> <span className="font-mono">pylon</span> <Kbd>⏎</Kbd>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-0.5" role="list" aria-label="Build steps">
      <div className="hidden grid-cols-[1.25rem_3rem_3.75rem_minmax(0,1.1fr)_minmax(0,1fr)_2rem] gap-x-1 px-1 pb-1 text-xs font-medium text-muted-foreground lg:grid">
        <span />
        <span className="pr-1.5 text-right">Supply</span>
        <span className="px-1.5">Time</span>
        <span className="px-1.5">Action</span>
        <span className="px-3">Note</span>
      </div>
      {steps.map((step, index) => (
        <div role="listitem" key={step.id}>
          <StepRow
            step={step}
            supply={supplies[index]!}
            race={race}
            selected={index === selected}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
            onSelect={() => index !== selected && dispatch({ type: 'select', index })}
            onUpdate={(patch) => dispatch({ type: 'update', index, patch })}
            onRemove={() => dispatch({ type: 'remove', index })}
            onDuplicate={() => dispatch({ type: 'duplicate', index })}
            onMove={(direction) => dispatch({ type: 'move', from: index, to: index + direction })}
            onInsertSection={() =>
              dispatch({ type: 'insert', at: index, steps: [{ kind: 'section', count: 1, label: 'New section' }] })
            }
          />
        </div>
      ))}
    </div>
  )
}
