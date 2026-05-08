import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          if (error?.status === 401 || error?.status === 403) return false
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })

  return {
    queryClient,
  }
}

export default function TanstackQueryProvider() {}
