import { getItemDetails } from "@/api/customer"
import queryClient from "@/lib/queryClient"

/** Warm item options before the modal opens (touch/hover on menu card). */
export function prefetchItemDetails(branchId: string, itemId: number, lang: string) {
  if (!branchId || !itemId) return
  void queryClient.prefetchQuery({
    queryKey: ["itemDetails", branchId, itemId, lang],
    queryFn: () => getItemDetails(branchId, String(itemId)),
    staleTime: 5 * 60_000
  })
}
