import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/lib/auth-client'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function SiteHeader() {
  const session = useSession()
  const user = session.data?.user

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'text-foreground' }} className="text-muted-foreground">
              Browse
            </Link>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" asChild>
            <Link to="/new">
              <PlusIcon data-icon="inline-start" />
              New build
            </Link>
          </Button>
          <ThemeToggle />
          {session.isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
