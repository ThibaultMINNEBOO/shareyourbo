import type { en } from './en'

export type Messages = typeof en
export type Locale = 'en' | 'fr'
export const LOCALES: Locale[] = ['en', 'fr']

type Plural = { one: string; other: string }

/** Dot-separated paths to every leaf (string or plural) of the dictionary. */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string | Plural ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]

export type MessageKey = Paths<Messages>

/** Keys whose value is a plural object (require a `count` variable). */
type PluralPaths<T> = {
  [K in keyof T & string]: T[K] extends Plural ? K : T[K] extends string ? never : `${K}.${PluralPaths<T[K]>}`
}[keyof T & string]

export type PluralKey = PluralPaths<Messages>
