import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { fr } from './fr'
import { createTranslator } from './index'

function leafPaths(node: object, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' || 'other' in value ? [path] : leafPaths(value, path)
  })
}

describe('i18n', () => {
  it('has the same keys in every language', () => {
    expect(leafPaths(fr).sort()).toEqual(leafPaths(en).sort())
  })

  it('translates and interpolates', () => {
    expect(createTranslator('en').t('card.by', { author: 'Maru', time: 'today' })).toBe('by Maru · today')
    expect(createTranslator('fr').t('card.by', { author: 'Maru', time: "aujourd'hui" })).toBe("par Maru · aujourd'hui")
  })

  it('applies each language plural rules', () => {
    const enT = createTranslator('en').t
    const frT = createTranslator('fr').t
    expect(enT('common.steps', { count: 1 })).toBe('1 step')
    expect(enT('common.steps', { count: 0 })).toBe('0 steps')
    expect(frT('common.steps', { count: 0 })).toBe('0 étape')
    expect(frT('common.steps', { count: 3 })).toBe('3 étapes')
  })

  it('inserts React nodes with rich()', () => {
    const parts = createTranslator('en').rich('auth.login.noAccount', { link: <a href="/signup">Create one</a> })
    expect(parts[0]).toBe('No account yet? ')
    expect(isValidElement(parts[1])).toBe(true)
  })
})
