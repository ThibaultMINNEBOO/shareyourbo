import type { useI18n } from '@/i18n'
import { en } from '@/i18n/en'

type AuthErrorCode = keyof typeof en.auth.errors

/** Translate a better-auth error by its code, falling back to `fallback`. */
export function authErrorMessage(
  t: ReturnType<typeof useI18n>['t'],
  error: { code?: string; message?: string },
  fallback: string,
) {
  if (error.code && error.code in en.auth.errors) return t(`auth.errors.${error.code as AuthErrorCode}`)
  return error.message || fallback
}
