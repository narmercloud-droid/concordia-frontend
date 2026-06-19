import { readMenuCache, readMenuCacheUpdatedAt } from "@/lib/menuCache"

export const menuQueryOptions = {
  staleTime: 0,
  gcTime: 7 * 24 * 60 * 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1500 * 2 ** attempt, 12_000),
  refetchOnMount: true,
  refetchOnWindowFocus: true
}

export type MenuCacheData = { categories: unknown[] }

export function menuQueryOptionsFor(branchId: string, lang: string) {
  const updatedAt = readMenuCacheUpdatedAt(branchId, lang)
  return {
    ...menuQueryOptions,
    initialData: () => readMenuCache(branchId, lang) ?? undefined,
    initialDataUpdatedAt: updatedAt,
    placeholderData: (previous: MenuCacheData | undefined) =>
      previous ?? readMenuCache(branchId, lang) ?? undefined
  }
}

export const bestsellersQueryOptions = {
  staleTime: 0,
  gcTime: 20 * 60_000,
  retry: 1,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 6000)
}
