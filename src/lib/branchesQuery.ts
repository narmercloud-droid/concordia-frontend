import { warmupApi } from "@/api/warmup"

export const BRANCHES_QUERY_KEY = ["branches"] as const

export const branchesQueryOptions = {
  queryFn: async () => {
    await warmupApi()
    const { getBranches } = await import("@/api/customer")
    return getBranches()
  },
  retry: 4,
  retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 12000),
  staleTime: 90_000,
  gcTime: 15 * 60_000,
  refetchOnWindowFocus: false,
  placeholderData: (previousData: unknown) => previousData
}
