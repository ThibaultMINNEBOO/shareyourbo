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
import { authClient } from '@/lib/auth-client'
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { data, errors } = validate(signInSchema, Object.fromEntries(new FormData(e.currentTarget)))
    setErrors(errors ?? {})
    setFormError(null)
    if (!data) return
    setPending(true)
    const { error } = await authClient.signIn.email(data)
    setPending(false)
    if (error) return setFormError(error.message ?? 'Could not sign in')
    navigate({ to: redirect ?? '/' })
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to create and like build orders."
      footer={
        <span>
          No account yet?{' '}
          <Link to="/signup" search={{ redirect }} className="font-medium text-primary hover:underline">
            Create one
          </Link>
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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} />
            <FieldError>{errors.password}</FieldError>
          </Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner data-icon="inline-start" />}
            Sign in
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
