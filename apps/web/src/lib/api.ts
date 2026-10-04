import type { AppType } from '@sybo/api'
import { hc } from 'hono/client'

export const api = hc<AppType>('/', { init: { credentials: 'include' } }).api

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Unwrap a hono client response, throwing ApiError on non-2xx. */
export async function unwrap<T>(res: Promise<{ ok: boolean; status: number; json(): Promise<T> }>) {
  const r = await res
  if (!r.ok) {
    const body = (await r.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(r.status, body?.error ?? `Request failed (${r.status})`)
  }
  return r.json()
}
