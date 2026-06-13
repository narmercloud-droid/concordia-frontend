import queryClient from "@/lib/queryClient"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { getBranchMenu } from "@/api/customer"
import { resolveAppLanguage } from "@/i18n/languages"
import { menuQueryOptionsFor } from "@/lib/customerQueryOptions"

export function prefetchBranchMenu(branchId: string, lang?: string) {
  const resolvedLang = lang ?? resolveAppLanguage()
  void queryClient.prefetchQuery({
    queryKey: ["branchMenu", branchId, resolvedLang],
    queryFn: () => getBranchMenu(branchId),
    ...menuQueryOptionsFor(branchId, resolvedLang)
  })
}

export function prefetchBranches() {
  void queryClient.prefetchQuery({
    queryKey: BRANCHES_QUERY_KEY,
    ...branchesQueryOptions
  })
}
