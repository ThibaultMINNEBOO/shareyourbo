import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { SiteHeader } from '@/components/layout/site-header'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  const { t } = useI18n()
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50">
          {t('header.skipToContent')}
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
