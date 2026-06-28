import React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  getBranchCouponCampaigns,
  listMyCoupons,
  formatCouponDiscount
} from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"
import CouponCard from "@/apps/customer/components/CouponCard"
import "@/apps/customer/components/InfoPages.css"

export default function CouponsPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get("branchId") ?? "concordia-kempen"
  const isLoggedIn = !!useAuthStore((s) => s.token)

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["couponCampaigns", branchId],
    queryFn: () => getBranchCouponCampaigns(branchId),
    enabled: !!branchId
  })

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["customerCoupons", branchId],
    queryFn: () => listMyCoupons(branchId),
    enabled: isLoggedIn
  })

  const campaigns = campaignsData?.campaigns ?? []
  const wallet = walletData?.coupons ?? []

  return (
    <div className="customer-page">
      <header className="coupon-page__header">
        <p className="customer-eyebrow">{t("coupons.eyebrow")}</p>
        <h1 className="customer-title">{t("coupons.title")}</h1>
        <p className="customer-hint">{t("coupons.lead")}</p>
        {!isLoggedIn && (
          <p className="customer-alert customer-alert--info">
            {t("coupons.loginHint")}{" "}
            <Link to={`/customer/register?branchId=${branchId}`}>{t("auth.register")}</Link>
          </p>
        )}
      </header>

      {isLoggedIn && (
        <section className="coupon-page__section">
          <h2 className="coupon-page__section-title">{t("coupons.walletTitle")}</h2>
          {walletLoading ? (
            <p className="customer-hint">{t("common.loading")}</p>
          ) : wallet.length === 0 ? (
            <p className="customer-hint">{t("coupons.walletEmpty")}</p>
          ) : (
            <ul className="coupon-wallet">
              {wallet.map((coupon) => (
                <li key={coupon.id} className="coupon-wallet__item">
                  <div>
                    <strong>{coupon.campaign.title}</strong>
                    <p className="customer-hint">
                      {formatCouponDiscount(
                        coupon.campaign.discountType,
                        coupon.campaign.discountValue,
                        t
                      )}
                      {coupon.campaign.minOrder > 0 &&
                        ` · ${t("coupons.minOrder", {
                          amount: coupon.campaign.minOrder.toFixed(2).replace(".", ",")
                        })}`}
                    </p>
                    <p className="customer-hint">{coupon.claimCode}</p>
                  </div>
                  <span
                    className={`coupon-wallet__status coupon-wallet__status--${coupon.status}`}
                  >
                    {t(`coupons.status.${coupon.status}`, { defaultValue: coupon.status })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {walletData?.activatedCouponId && (
            <p className="customer-alert customer-alert--success">
              {t("coupons.checkoutHint")}
            </p>
          )}
        </section>
      )}

      <section className="coupon-page__section">
        <h2 className="coupon-page__section-title">{t("coupons.availableTitle")}</h2>
        {campaignsLoading ? (
          <p className="customer-hint">{t("common.loading")}</p>
        ) : campaigns.length === 0 ? (
          <p className="customer-hint">{t("coupons.noneAvailable")}</p>
        ) : (
          <div className="coupon-page__grid">
            {campaigns.map((campaign) => (
              <CouponCard key={campaign.id} campaign={campaign} branchId={branchId} />
            ))}
          </div>
        )}
      </section>

      <p className="customer-hint">
        {t("coupons.orderCta")}{" "}
        <Link to={`/branch/${branchId}`}>{t("home.orderNow")}</Link>
      </p>
    </div>
  )
}
