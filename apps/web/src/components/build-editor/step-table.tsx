import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Race, type Step, computeSupply } from '@sybo/shared'
import { cn } from 'cn'
import { ListPlusIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/i18n'
import type { EditorAction } from './editor-state'
import { StepRow } from './step-row'

function SortableItem({
  id,
  children,
}: {
  id: string
  children: (handleProps: React.HTMLAttributes<HTMLButtonElement>) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      role="listitem"
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 rounded-md bg-card shadow-lg ring-1 ring-primary/40')}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  )
}

type Props = {
  steps: Step[]
  race: Race
  selected: number
  dispatch: React.Dispatch<EditorAction>
}

export function StepTable({ steps, race, selected, dispatch }: Props) {
  const supplies = useMemo(() => computeSupply(race, steps), [race, steps])
  const { t, rich } = useI18n()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = steps.findIndex((s) => s.id === active.id)
    const to = steps.findIndex((s) => s.id === over.id)
    if (from !== -1 && to !== -1) dispatch({ type: 'move', from, to })
  }

  if (!steps.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListPlusIcon />
          </EmptyMedia>
          <EmptyTitle>{t('editor.table.emptyTitle')}</EmptyTitle>
          <EmptyDescription>
            {rich('editor.table.emptyHint', {
              slash: <Kbd>/</Kbd>,
              example: (
                <>
                  <span className="font-mono">{t('editor.table.exampleFirst')}</span> <Kbd>⏎</Kbd>{' '}
                  <span className="font-mono">{t('editor.table.exampleSecond')}</span>{' '}
                  <Kbd>⏎</Kbd>
                </>
              ),
            })}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-0.5" role="list" aria-label={t('editor.table.label')}>
      <div className="hidden grid-cols-[1.25rem_3rem_3.75rem_minmax(0,1.1fr)_minmax(0,1fr)_2rem] gap-x-1 px-1 pb-1 text-xs font-medium text-muted-foreground lg:grid">
        <span />
        <span className="pr-1.5 text-right">{t('editor.table.supply')}</span>
        <span className="px-1.5">{t('editor.table.time')}</span>
        <span className="px-1.5">{t('editor.table.action')}</span>
        <span className="px-3">{t('editor.table.note')}</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step, index) => (
            <SortableItem key={step.id} id={step.id}>
              {(handleProps) => (
                <StepRow
                  handleProps={handleProps}
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
                    dispatch({ type: 'insert', at: index, steps: [{ kind: 'section', count: 1, label: t('editor.newSection') }] })
                  }
                />
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
