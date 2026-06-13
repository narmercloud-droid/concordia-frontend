import {
  readBranchListCache,
  readBranchListCacheUpdatedAt,
  writeBranchListCache
} from "@/lib/branchListCache"

export const BRANCHES_QUERY_KEY = ["branches"] as const

export const branchesQueryOptions = {
  queryFn: async () => {
    const { getBranches } = await import("@/api/customer")
    const data = await getBranches()
    writeBranchListCache(data)
    return data
  },
  retry: 3,
  retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 12_000),
  staleTime: 600_000,
  gcTime: 7 * 24 * 60 * 60_000,
  refetchOnWindowFocus: false,
  initialData: () => readBranchListCache() ?? undefined,
  initialDataUpdatedAt: () => readBranchListCacheUpdatedAt() ?? 0
}
