import { signUpSchema } from '@sybo/shared'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { AuthCard } from '@/components/auth/auth-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { type FieldErrors, validate } from '@/lib/form'

export const Route = createFileRoute('/signup')({
  validateSearch: z.object({ redirect: z.string().startsWith('/').optional() }),
  component: SignUpPage,
})

function SignUpPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FieldErrors<z.input<typeof signUpSchema>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { data, errors } = validate(signUpSchema, Object.fromEntries(new FormData(e.currentTarget)))
    setErrors(errors ?? {})
    setFormError(null)
    if (!data) return
    setPending(true)
    const { error } = await authClient.signUp.email({ ...data, name: data.username })
    setPending(false)
    if (error) return setFormError(error.message ?? 'Could not create the account')
    navigate({ to: redirect ?? '/' })
  }

  return (
    <AuthCard
      title="Create an account"
      description="Share your builds with the community."
      footer={
        <span>
          Already registered?{' '}
          <Link to="/login" search={{ redirect }} className="font-medium text-primary hover:underline">
            Sign in
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
          <Field data-invalid={!!errors.username || undefined}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" name="username" autoComplete="username" autoFocus aria-invalid={!!errors.username} />
            {errors.username ? (
              <FieldError>{errors.username}</FieldError>
            ) : (
              <FieldDescription>Shown on your builds. Letters, digits and underscores.</FieldDescription>
            )}
          </Field>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} />
            {errors.password ? (
              <FieldError>{errors.password}</FieldError>
            ) : (
              <FieldDescription>At least 8 characters.</FieldDescription>
            )}
          </Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner data-icon="inline-start" />}
            Create account
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
