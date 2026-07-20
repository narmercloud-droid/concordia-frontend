import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  formatCouponDiscount,
  getBranchCouponCampaigns,
  listMyCoupons
} from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"

type Props = {
  branchId: string
  id?: string
}

export default function CouponWalletSection({ branchId, id = "wallet" }: Props) {
  const { t } = useTranslation()
  const isLoggedIn = !!useAuthStore((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: ["couponCampaigns", branchId, "active"],
    queryFn: () => getBranchCouponCampaigns(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const { data: walletData } = useQuery({
    queryKey: ["customerCoupons", branchId],
    queryFn: () => listMyCoupons(branchId),
    enabled: isLoggedIn && !!branchId
  })

  const activatedIds = new Set(
    walletData?.activatedCouponIds?.length
      ? walletData.activatedCouponIds
      : walletData?.activatedCouponId
        ? [walletData.activatedCouponId]
        : []
  )

  const claimable = (data?.campaigns ?? []).filter((c) => !c.alwaysActive)

  return (
    <section id={id} className="coupon-page__section offers-wallet">
      <h2 className="coupon-page__section-title">{t("coupons.walletTitle")}</h2>
      {isLoading ? (
        <p className="customer-hint">{t("common.loading")}</p>
      ) : claimable.length === 0 ? (
        <p className="customer-hint">{t("coupons.walletEmpty")}</p>
      ) : (
        <ul className="coupon-wallet">
          {claimable.map((coupon) => {
            const activated =
              coupon.status === "activated" ||
              (coupon.customerCouponId ? activatedIds.has(coupon.customerCouponId) : false)
            return (
              <li
                key={coupon.id}
                className={`coupon-wallet__item${activated ? " coupon-wallet__item--active" : ""}`}
              >
                <div className="coupon-wallet__main">
                  <strong>{coupon.title}</strong>
                  <p className="customer-hint">
                    {formatCouponDiscount(coupon.discountType, coupon.discountValue, t)}
                    {coupon.minOrder > 0 &&
                      ` · ${t("coupons.minOrder", {
                        amount: coupon.minOrder.toFixed(2).replace(".", ",")
                      })}`}
                  </p>
                  {coupon.description ? (
                    <p className="customer-hint" style={{ marginTop: 4 }}>
                      {coupon.description}
                    </p>
                  ) : null}
                </div>
                <div className="coupon-wallet__actions">
                  <span
                    className={`coupon-wallet__status${
                      activated ? " coupon-wallet__status--activated" : ""
                    }`}
                  >
                    {activated
                      ? t("coupons.status.activated")
                      : coupon.claimed
                        ? t("coupons.inWallet")
                        : t("coupons.tapToClaim")}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
