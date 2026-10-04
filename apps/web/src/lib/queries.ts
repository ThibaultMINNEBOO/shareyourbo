import type { BuildListQuery } from '@sybo/shared'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { api, unwrap } from './api'

export type BuildDetail = InferResponseType<(typeof api.builds)[':slug']['$get'], 200>
export type BuildSummary = InferResponseType<typeof api.builds.$get, 200>['items'][number]

export const buildQuery = (slug: string) =>
  queryOptions({
    queryKey: ['build', slug],
    queryFn: () => unwrap(api.builds[':slug'].$get({ param: { slug } })),
  })

type ListFilters = Omit<BuildListQuery, 'cursor' | 'limit'>

export const buildListQuery = (filters: ListFilters) =>
  infiniteQueryOptions({
    queryKey: ['builds', filters],
    queryFn: ({ pageParam }) =>
      unwrap(
        api.builds.$get({
          query: { ...filters, ...(pageParam ? { cursor: pageParam } : {}) } as Record<string, string>,
        }),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  })

export const userQuery = (username: string) =>
  queryOptions({
    queryKey: ['user', username.toLowerCase()],
    queryFn: () => unwrap(api.users[':username'].$get({ param: { username } })),
  })
