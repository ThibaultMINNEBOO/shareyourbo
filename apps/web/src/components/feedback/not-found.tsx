import { Link } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function NotFound({ title = 'Not found', description }: { title?: string; description?: string }) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link to="/">Browse builds</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
