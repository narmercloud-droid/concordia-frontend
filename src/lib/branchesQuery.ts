import { readBranchListCache, writeBranchListCache } from "@/lib/branchListCache"

export const BRANCHES_QUERY_KEY = ["branches"] as const

export const branchesQueryOptions = {
  queryFn: async () => {
    const { getBranches } = await import("@/api/customer")
    const data = await getBranches()
    writeBranchListCache(data)
    return data
  },
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
  staleTime: 600_000,
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  placeholderData: () => readBranchListCache() ?? undefined
}
