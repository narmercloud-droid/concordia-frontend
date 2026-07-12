import { useQuery } from "@tanstack/react-query"
import api from "@/api/client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export type PlatformPromo = {
  websiteOrderDiscountPct: number
  freeDrinkCheckoutEnabled: boolean
  showFreeDrinkCheckout: boolean
  showLoyaltyCheckout: boolean
}

const DEFAULT: PlatformPromo = {
  websiteOrderDiscountPct: 10,
  freeDrinkCheckoutEnabled: false,
  showFreeDrinkCheckout: false,
  showLoyaltyCheckout: false
}

export function usePlatformPromo() {
  const { data } = useQuery({
    queryKey: ["platformPromo"],
    queryFn: async () => {
      const res = await api.get("/api/platform-promo")
      return unwrap<PlatformPromo>(res)
    },
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

  return data ?? DEFAULT
}
