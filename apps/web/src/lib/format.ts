import { useMemo } from 'react'
import { type Locale, useI18n } from '@/i18n'

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function formatDate(value: string | Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value))
}

export function timeAgo(value: string | Date, locale: Locale) {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const seconds = (new Date(value).getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return relative.format(0, 'second')
}

export function compactNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(value)
}

/** Formatters bound to the current UI language. */
export function useFormat() {
  const { locale } = useI18n()
  return useMemo(
    () => ({
      formatDate: (value: string | Date) => formatDate(value, locale),
      timeAgo: (value: string | Date) => timeAgo(value, locale),
      compactNumber: (value: number) => compactNumber(value, locale),
    }),
    [locale],
  )
}
