import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60_000,
      gcTime: 20 * 60_000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          return false
        }
        return failureCount < 4
      },
      retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 20_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always"
    },
    mutations: {
      retry: 1
    }
  }
})

export default queryClient
