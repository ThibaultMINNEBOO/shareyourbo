import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOutIcon, UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n'
import { authClient, type SessionUser } from '@/lib/auth-client'

export function UserMenu({ user }: { user: SessionUser }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const handle = user.displayUsername ?? user.username ?? user.name

  async function signOut() {
    await authClient.signOut()
    queryClient.clear()
    navigate({ to: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('header.accountMenu')}>
          <Avatar className="size-7">
            <AvatarFallback className="text-xs font-semibold uppercase">{handle.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="truncate">{handle}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.username && (
            <DropdownMenuItem asChild>
              <Link to="/u/$username" params={{ username: user.username }}>
                <UserIcon />
                {t('header.myBuilds')}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={signOut}>
            <LogOutIcon />
            {t('header.signOut')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
