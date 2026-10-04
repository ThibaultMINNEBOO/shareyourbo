import { type GameAction, actionName, actionShort } from '@sybo/shared'
import { useMemo } from 'react'
import { useI18n } from '@/i18n'

/** Unit/building/upgrade names in the current UI language. */
export function useActionNames() {
  const { locale } = useI18n()
  return useMemo(
    () => ({
      name: (action: GameAction) => actionName(action, locale),
      short: (action: GameAction) => actionShort(action, locale),
    }),
    [locale],
  )
}
