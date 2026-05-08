import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from '#/components/ui/sonner'
import { Provider as JotaiProvider } from 'jotai'
import { TooltipProvider } from '#/components/ui/tooltip'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Tanilytics — Privacy-first Analytics',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-body antialiased [overflow-wrap:anywhere]">
        <TooltipProvider>
          <JotaiProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-card border-border text-foreground',
              }}
            />
          </JotaiProvider>
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
