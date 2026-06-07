export const BRANCHES_QUERY_KEY = ["branches"] as const

export const branchesQueryOptions = {
  retry: 4,
  retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 12000),
  staleTime: 60_000,
  refetchOnWindowFocus: true
}
