import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { en } from './en'
import { fr } from './fr'
import { LOCALES, type Locale, type MessageKey, type Messages, type PluralKey } from './types'

export type { Locale, MessageKey } from './types'
export { LOCALES } from './types'

const DICTIONARIES: Record<Locale, Messages> = { en, fr }
const STORAGE_KEY = 'sybo-locale'

export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', fr: 'Français' }

type Vars = Record<string, string | number>

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale
  } catch {
    // storage unavailable
  }
  return navigator.languages?.some((l) => l.toLowerCase().startsWith('fr')) ? 'fr' : 'en'
}

function lookup(dict: Messages, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict)
}

function interpolate(template: string, vars: Vars = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match))
}

export function createTranslator(locale: Locale) {
  const dict = DICTIONARIES[locale]
  const plurals = new Intl.PluralRules(locale)

  function resolve(key: string, vars?: Vars): string {
    const value = lookup(dict, key) ?? lookup(en, key)
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'other' in value) {
      const forms = value as { one: string; other: string }
      const count = Number(vars?.count ?? 0)
      return plurals.select(count) === 'one' ? forms.one : forms.other
    }
    return key
  }

  function t(key: PluralKey, vars: Vars & { count: number }): string
  function t(key: Exclude<MessageKey, PluralKey>, vars?: Vars): string
  function t(key: MessageKey, vars?: Vars) {
    return interpolate(resolve(key, vars), vars)
  }

  /** Like t(), but placeholders can be React nodes (links, <Kbd>…). */
  function rich(key: Exclude<MessageKey, PluralKey>, nodes: Record<string, React.ReactNode>): React.ReactNode[] {
    return resolve(key)
      .split(/(\{\w+\})/)
      .map((part, i) => {
        const name = part.match(/^\{(\w+)\}$/)?.[1]
        return name && name in nodes ? <span key={i}>{nodes[name]}</span> : part
      })
  }

  return { t, rich }
}

type I18nContextValue = ReturnType<typeof createTranslator> & {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage unavailable: the choice lasts for this session
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ ...createTranslator(locale), locale, setLocale }), [locale, setLocale])
  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
