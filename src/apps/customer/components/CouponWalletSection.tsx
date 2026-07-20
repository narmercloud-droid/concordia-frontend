import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { formatCouponDiscount, getBranchCouponCampaigns } from "@/api/coupons"

type Props = {
  branchId: string
  id?: string
}

export default function CouponWalletSection({ branchId, id = "wallet" }: Props) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ["couponCampaigns", branchId, "active"],
    queryFn: () => getBranchCouponCampaigns(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const perks = (data?.campaigns ?? []).filter((c) => c.alwaysActive || c.status === "activated")

  return (
    <section id={id} className="coupon-page__section offers-wallet">
      <h2 className="coupon-page__section-title">{t("coupons.walletTitle")}</h2>
      <p className="customer-hint" style={{ marginTop: 0 }}>
        {t("coupons.alwaysActiveHint")}
      </p>
      {isLoading ? (
        <p className="customer-hint">{t("common.loading")}</p>
      ) : perks.length === 0 ? (
        <p className="customer-hint">{t("coupons.walletEmpty")}</p>
      ) : (
        <ul className="coupon-wallet">
          {perks.map((coupon) => (
            <li key={coupon.id} className="coupon-wallet__item coupon-wallet__item--active">
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
                <span className="coupon-wallet__status coupon-wallet__status--activated">
                  {t("coupons.alwaysActive")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {perks.length > 0 && (
        <p className="customer-alert customer-alert--success">{t("coupons.checkoutAutoHint")}</p>
      )}
    </section>
  )
}
