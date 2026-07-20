import React from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchCouponCampaigns, listAvailableCoupons } from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"
import CouponCard from "./CouponCard"
import "./InfoPages.css"

type Props = {
  branchId: string
  branchName?: string
  title?: string
  showViewAll?: boolean
}

export default function CouponCampaignStrip({
  branchId,
  branchName,
  title,
  showViewAll = true
}: Props) {
  const { t } = useTranslation()
  const isLoggedIn = !!useAuthStore((s) => s.token)
  const { data, isLoading } = useQuery({
    queryKey: ["couponCampaigns", branchId, isLoggedIn ? "auth" : "guest"],
    queryFn: () =>
      isLoggedIn ? listAvailableCoupons(branchId) : getBranchCouponCampaigns(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const campaigns = data?.campaigns ?? []
  if (!isLoading && campaigns.length === 0) return null

  return (
    <section className="coupon-strip" aria-label={title ?? t("coupons.sectionTitle")}>
      <div className="coupon-strip__head">
        <h2 className="coupon-strip__title">{title ?? t("coupons.sectionTitle")}</h2>
        {showViewAll && (
          <Link
            to={`/offers?branchId=${branchId}#coupons`}
            className="coupon-strip__link"
          >
            {t("coupons.viewAllOffers")}
          </Link>
        )}
      </div>
      {isLoading ? (
        <p className="customer-hint">{t("common.loading")}</p>
      ) : (
        <div className="coupon-strip__scroll">
          {campaigns.map((campaign) => (
            <CouponCard
              key={campaign.id}
              campaign={campaign}
              branchId={branchId}
              branchName={branchName}
              compact
            />
          ))}
        </div>
      )}
    </section>
  )
}
