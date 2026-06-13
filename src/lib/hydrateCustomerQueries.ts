import type { QueryClient } from "@tanstack/react-query"
import { detectPreferredLanguage } from "@/i18n/languages"
import { readBranchListCache, readBranchListCacheUpdatedAt } from "@/lib/branchListCache"
import { BRANCHES_QUERY_KEY } from "@/lib/branchesQuery"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import { readMenuCache, readMenuCacheUpdatedAt } from "@/lib/menuCache"

/** Seed React Query from localStorage before first paint so branches/menu render instantly. */
export function hydrateCustomerQueries(client: QueryClient) {
  if (typeof window === "undefined") return

  const branches = readBranchListCache()
  const branchesUpdatedAt = readBranchListCacheUpdatedAt()
  if (branches?.length) {
    client.setQueryData(BRANCHES_QUERY_KEY, branches)
    if (branchesUpdatedAt) {
      client.setQueryDefaults(BRANCHES_QUERY_KEY, {
        initialDataUpdatedAt: branchesUpdatedAt
      })
    }
  }

  const lang = detectPreferredLanguage()
  const menu = readMenuCache(KEMPEN_BRANCH_ID, lang)
  const menuUpdatedAt = readMenuCacheUpdatedAt(KEMPEN_BRANCH_ID, lang)
  if (menu?.categories?.length) {
    client.setQueryData(["branchMenu", KEMPEN_BRANCH_ID, lang], menu)
    if (menuUpdatedAt) {
      client.setQueryDefaults(["branchMenu", KEMPEN_BRANCH_ID, lang], {
        initialDataUpdatedAt: menuUpdatedAt
      })
    }
  }

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key?.startsWith("concordia-menu-v1:")) continue
      const suffix = key.slice("concordia-menu-v1:".length)
      const splitAt = suffix.lastIndexOf(":")
      if (splitAt <= 0) continue
      const branchId = suffix.slice(0, splitAt)
      const menuLang = suffix.slice(splitAt + 1)
      const cached = readMenuCache(branchId, menuLang)
      const updatedAt = readMenuCacheUpdatedAt(branchId, menuLang)
      if (!cached?.categories?.length) continue
      client.setQueryData(["branchMenu", branchId, menuLang], cached)
      if (updatedAt) {
        client.setQueryDefaults(["branchMenu", branchId, menuLang], {
          initialDataUpdatedAt: updatedAt
        })
      }
    }
  } catch {
    // ignore private mode
  }
}
