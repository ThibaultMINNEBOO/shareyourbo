import { signInSchema } from '@sybo/shared'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { AuthCard } from '@/components/auth/auth-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-errors'
import { type FieldErrors, validate } from '@/lib/form'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().startsWith('/').optional() }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FieldErrors<z.input<typeof signInSchema>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { t, rich } = useI18n()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { data, errors } = validate(signInSchema, Object.fromEntries(new FormData(e.currentTarget)))
    setErrors(
      errors
        ? {
            email: errors.email && t('auth.validation.email'),
            password: errors.password && t('auth.validation.required'),
          }
        : {},
    )
    setFormError(null)
    if (!data) return
    setPending(true)
    const { error } = await authClient.signIn.email(data)
    setPending(false)
    if (error) return setFormError(authErrorMessage(t, error, t('auth.login.failed')))
    navigate({ to: redirect ?? '/' })
  }

  return (
    <AuthCard
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      footer={
        <span>
          {rich('auth.login.noAccount', {
            link: (
              <Link to="/signup" search={{ redirect }} className="font-medium text-primary hover:underline">
                {t('auth.login.createOne')}
              </Link>
            ),
          })}
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} />
            <FieldError>{errors.password}</FieldError>
          </Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner data-icon="inline-start" />}
            {t('auth.login.submit')}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
