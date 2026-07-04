import type { QueryClient } from "@tanstack/react-query"
import { clearBranchListCache } from "@/lib/branchListCache"
import { clearMenuCacheForBranch } from "@/lib/menuCache"
import { clearItemDetailsCacheForBranch } from "@/lib/itemDetailsCache"
import { BRANCHES_QUERY_KEY } from "@/lib/branchesQuery"

/** After admin saves, bust customer-facing React Query + localStorage caches. */
export function invalidateCustomerWebsiteCaches(
  queryClient: QueryClient,
  branchId?: string | null
) {
  clearBranchListCache()
  void queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: ["branches"] })
  void queryClient.invalidateQueries({ queryKey: ["platformPromo"] })

  if (branchId) {
    clearMenuCacheForBranch(branchId)
    clearItemDetailsCacheForBranch(branchId)
    void queryClient.invalidateQueries({ queryKey: ["branchMenu", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["branchBestsellers", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["cartSuggestions", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["itemDetails", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["googleReviews", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["deliveryAreas", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["timeSlots", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["paymentConfig", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["couponCampaigns", branchId] })
  } else {
    void queryClient.invalidateQueries({ queryKey: ["deliveryAreas"] })
    void queryClient.invalidateQueries({ queryKey: ["timeSlots"] })
    void queryClient.invalidateQueries({ queryKey: ["paymentConfig"] })
    void queryClient.invalidateQueries({ queryKey: ["couponCampaigns"] })
  }
}
