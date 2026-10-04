const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatDate(value: string | Date) {
  return dateFormat.format(new Date(value))
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function timeAgo(value: string | Date) {
  const seconds = (new Date(value).getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export function compactNumber(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}
