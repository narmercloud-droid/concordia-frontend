import { warmupApi } from "@/api/warmup"

export const BRANCHES_QUERY_KEY = ["branches"] as const

export const branchesQueryOptions = {
  queryFn: async () => {
    void warmupApi()
    const { getBranches } = await import("@/api/customer")
    return getBranches()
  },
  retry: 3,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
  staleTime: 300_000,
  gcTime: 15 * 60_000,
  refetchOnWindowFocus: false,
  placeholderData: (previousData: unknown) => previousData
}
