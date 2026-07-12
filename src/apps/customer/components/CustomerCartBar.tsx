import React, { useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { useCartStore } from "@/store/cartStore"
import { isNativeApp } from "@/lib/nativeApp"
import { formatCurrency } from "@/utils/format"
import { loadFulfillmentIntent } from "@/lib/fulfillmentIntent"
import { getBranchDeliveryAreas } from "@/api/customer"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { usePlatformPromo } from "@/hooks/usePlatformPromo"
import { estimateCartDisplay } from "@/lib/cartEstimate"

export default function CustomerCartBar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const nativeApp = isNativeApp()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.total())
  const branchId = items[0]?.branchId ?? ""
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const platformPromo = usePlatformPromo()

  const { data: branches } = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    ...branchesQueryOptions,
    enabled: !!branchId
  })
  const { data: deliveryInfo } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const fulfillment = branchId ? loadFulfillmentIntent(branchId) ?? "delivery" : "delivery"
  const branchPromo = branches?.find((b: { id: string }) => b.id === branchId)?.promotions
  const discountPct =
    branchPromo?.websiteDiscountEnabled !== false ? platformPromo.websiteOrderDiscountPct : 0

  const estimate = useMemo(
    () =>
      estimateCartDisplay({
        subtotal,
        discountPct,
        fulfillment,
        zones: deliveryInfo?.radiusZones ?? []
      }),
    [subtotal, discountPct, fulfillment, deliveryInfo?.radiusZones]
  )

  if (itemCount === 0) return null
  if (location.pathname.startsWith("/customer/checkout")) return null

  const onBranchMenu = location.pathname.startsWith("/branch/")
  const onCart = location.pathname === "/customer/cart"
  if (!onBranchMenu && !onCart) return null

  const totalLabel =
    fulfillment === "delivery" && estimate.estimatedDeliveryFee != null
      ? t("cart.barTotalDelivery", {
          food: formatCurrency(estimate.foodTotal),
          fee: formatCurrency(estimate.estimatedDeliveryFee)
        })
      : formatCurrency(estimate.foodTotal)

  const metaLabel =
    fulfillment === "pickup" ? t("checkout.pickup") : t("checkout.delivery")

  return (
    <div
      className={`customer-cart-bar${nativeApp ? " customer-cart-bar--native" : ""}`}
      role="region"
      aria-label={t("nativeApp.cartBar.label")}
    >
      <div className="customer-cart-bar__summary">
        <span className="customer-cart-bar__count">
          {t("nativeApp.cartBar.items", { count: itemCount })}
          <span className="customer-cart-bar__meta"> · {metaLabel}</span>
        </span>
        <span className="customer-cart-bar__total">{totalLabel}</span>
      </div>
      <div className="customer-cart-bar__actions">
        {!onCart ? (
          <Link to="/customer/cart" className="customer-cart-bar__secondary">
            {t("layout.cart")}
          </Link>
        ) : null}
        <button
          type="button"
          className="customer-cart-bar__cta"
          onClick={() => navigate("/customer/checkout")}
        >
          {t("cart.checkout")}
        </button>
      </div>
    </div>
  )
}
