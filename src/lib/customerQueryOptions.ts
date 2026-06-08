export const menuQueryOptions = {
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
  retryDelay: (attempt: number) => Math.min(1200 * 2 ** attempt, 8000)
}

export const bestsellersQueryOptions = {
  staleTime: 10 * 60_000,
  gcTime: 20 * 60_000,
  retry: 1,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 6000)
}
