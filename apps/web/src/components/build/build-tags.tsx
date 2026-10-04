import type { BuildTag } from '@sybo/shared'
import { Badge } from '@/components/ui/badge'

export function BuildTags({ tags }: { tags: BuildTag[] }) {
  if (!tags.length) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary" className="capitalize">
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
