import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { cn } from 'cn'
import { HeartIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api, unwrap } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { compactNumber } from '@/lib/format'
import { type BuildDetail, buildQuery } from '@/lib/queries'

export function LikeButton({ slug, data }: { slug: string; data: BuildDetail }) {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { queryKey } = buildQuery(slug)
  const { likedByMe, build } = data

  const toggle = useMutation({
    mutationFn: async (like: boolean): Promise<{ liked: boolean }> => {
      const param = { param: { id: build.id } }
      return like ? unwrap(api.builds[':id'].like.$post(param)) : unwrap(api.builds[':id'].like.$delete(param))
    },
    onMutate: async (like) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) =>
        old && {
          ...old,
          likedByMe: like,
          build: { ...old.build, likesCount: Math.max(0, old.build.likesCount + (like ? 1 : -1)) },
        },
      )
      return { previous }
    },
    onError: (error, _like, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['builds'] }),
  })

  function onClick() {
    if (!session.data?.user) {
      navigate({ to: '/login', search: { redirect: location.href } })
      return
    }
    toggle.mutate(!likedByMe)
  }

  return (
    <Button
      variant={likedByMe ? 'secondary' : 'outline'}
      onClick={onClick}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? 'Unlike this build' : 'Like this build'}
    >
      <HeartIcon data-icon="inline-start" className={cn(likedByMe && 'fill-current text-zerg')} />
      {compactNumber(build.likesCount)}
    </Button>
  )
}
