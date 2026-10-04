import { Link } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { type TextKey, useI18n } from '@/i18n'

export function NotFound({ titleKey = 'notFound.title', descriptionKey }: { titleKey?: TextKey; descriptionKey?: TextKey }) {
  const { t } = useI18n()
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>{t(titleKey)}</EmptyTitle>
        {descriptionKey && <EmptyDescription>{t(descriptionKey)}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link to="/">{t('common.browseBuilds')}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
