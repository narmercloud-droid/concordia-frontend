import { readMenuCache, readMenuCacheUpdatedAt } from "@/lib/menuCache"

export const menuQueryOptions = {
  staleTime: 30 * 60_000,
  gcTime: 7 * 24 * 60 * 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 12_000)
}

export function menuQueryOptionsFor(branchId: string, lang: string) {
  const updatedAt = readMenuCacheUpdatedAt(branchId, lang)
  return {
    ...menuQueryOptions,
    initialData: () => readMenuCache(branchId, lang) ?? undefined,
    initialDataUpdatedAt: updatedAt,
    placeholderData: (previous: unknown) =>
      previous ?? readMenuCache(branchId, lang) ?? undefined
  }
}

export const bestsellersQueryOptions = {
  staleTime: 10 * 60_000,
  gcTime: 20 * 60_000,
  retry: 1,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 6000)
}
