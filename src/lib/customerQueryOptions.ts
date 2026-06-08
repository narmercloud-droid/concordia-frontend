export const menuQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1200 * 2 ** attempt, 12_000)
}

export const bestsellersQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 20 * 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000)
}
