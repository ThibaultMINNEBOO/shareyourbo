import { createContext, useCallback, useContext, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'sybo-theme'

type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // storage unavailable: theme still applies for this session
      }
      return next
    })
  }, [])

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
