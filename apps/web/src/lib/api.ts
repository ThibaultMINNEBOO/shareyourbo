import type { AppType } from '@sybo/api'
import { type ClientResponse, hc } from 'hono/client'
import type { ClientErrorStatusCode, ServerErrorStatusCode } from 'hono/utils/http-status'

export const api = hc<AppType>('/', { init: { credentials: 'include' } }).api

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type ErrorStatus = ClientErrorStatusCode | ServerErrorStatusCode

/** Body type of the non-error responses in a union of client responses. */
type OkBody<R> = R extends ClientResponse<infer T, infer S, string> ? ([S] extends [ErrorStatus] ? never : T) : never

/** Unwrap a hono client response, throwing ApiError on non-2xx. */
export async function unwrap<R extends ClientResponse<unknown, number, string>>(res: Promise<R>): Promise<OkBody<R>> {
  const r = await res
  if (!r.ok) {
    const body = (await r.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(r.status, body?.error ?? `Request failed (${r.status})`)
  }
  return r.json() as Promise<OkBody<R>>
}
