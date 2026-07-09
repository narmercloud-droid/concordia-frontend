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
  retry: 5,
  retryDelay: (attempt: number) => Math.min(2000 * 2 ** attempt, 20_000),
  staleTime: 5 * 60_000,
  gcTime: 7 * 24 * 60 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  initialData: () => readBranchListCache() ?? undefined,
  initialDataUpdatedAt: () => readBranchListCacheUpdatedAt() ?? 0,
  placeholderData: (previous: any[] | undefined) => previous ?? readBranchListCache() ?? undefined
} as const
