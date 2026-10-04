import { redirect } from '@tanstack/react-router'
import { authClient } from './auth-client'

/** Route `beforeLoad` guard: sends anonymous visitors to /login and back afterwards. */
export async function requireAuth({ location }: { location: { href: string } }) {
  const { data } = await authClient.getSession()
  if (!data?.user) throw redirect({ to: '/login', search: { redirect: location.href } })
  return { user: data.user }
}
