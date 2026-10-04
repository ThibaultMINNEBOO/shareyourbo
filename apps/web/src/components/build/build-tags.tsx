import type { BuildTag } from '@sybo/shared'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'

export function BuildTags({ tags }: { tags: BuildTag[] }) {
  const { t } = useI18n()
  if (!tags.length) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t('editor.meta.tags')}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary">
            {t(`tags.${tag}`)}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
