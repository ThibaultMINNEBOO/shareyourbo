import { type Step, stepsToText } from '@sybo/shared'
import { ClipboardCopyIcon, LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

async function copy(text: string, message: string, errorMessage: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  } catch {
    toast.error(errorMessage)
  }
}

export function CopyActions({ title, steps }: { title: string; steps: Step[] }) {
  const { t } = useI18n()
  const error = t('common.clipboardError')
  return (
    <>
      <Button variant="outline" onClick={() => copy(window.location.href, t('build.linkCopied'), error)}>
        <LinkIcon data-icon="inline-start" />
        {t('build.copyLink')}
      </Button>
      <Button variant="outline" onClick={() => copy(`${title}\n\n${stepsToText(steps)}`, t('build.textCopied'), error)}>
        <ClipboardCopyIcon data-icon="inline-start" />
        {t('build.copyText')}
      </Button>
    </>
  )
}
