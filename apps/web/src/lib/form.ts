import { z } from 'zod'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

/** Parse form values; returns data or the first error message per field. */
export function validate<S extends z.ZodType>(schema: S, values: unknown) {
  const result = schema.safeParse(values)
  if (result.success) return { data: result.data as z.output<S>, errors: null }
  const fieldErrors = z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>
  const errors: Record<string, string> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) errors[key] = messages[0]
  }
  return { data: null, errors: errors as FieldErrors<z.input<S>> }
}
