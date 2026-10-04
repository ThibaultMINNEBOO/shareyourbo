import { type Step, stepsToText } from '@sybo/shared'
import { ClipboardCopyIcon, LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

async function copy(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  } catch {
    toast.error('Could not access the clipboard')
  }
}

export function CopyActions({ title, steps }: { title: string; steps: Step[] }) {
  return (
    <>
      <Button variant="outline" onClick={() => copy(window.location.href, 'Link copied')}>
        <LinkIcon data-icon="inline-start" />
        Copy link
      </Button>
      <Button variant="outline" onClick={() => copy(`${title}\n\n${stepsToText(steps)}`, 'Build copied as text')}>
        <ClipboardCopyIcon data-icon="inline-start" />
        Copy as text
      </Button>
    </>
  )
}
