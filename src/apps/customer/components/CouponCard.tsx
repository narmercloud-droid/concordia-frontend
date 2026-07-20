import React from "react"
import { useTranslation } from "react-i18next"
import { type CouponCampaign, formatCouponDiscount } from "@/api/coupons"

type Props = {
  campaign: CouponCampaign
  branchId: string
  compact?: boolean
  branchName?: string
}

export default function CouponCard({ campaign, compact, branchName }: Props) {
  const { t } = useTranslation()
  const alwaysActive = Boolean(campaign.alwaysActive || campaign.status === "activated")

  const discountLabel = formatCouponDiscount(
    campaign.discountType,
    campaign.discountValue,
    t
  )

  if (alwaysActive) {
    return (
      <div
        className={`coupon-card coupon-card--always-active${compact ? " coupon-card--compact" : ""}`}
        aria-label={campaign.title}
      >
        <div className="coupon-card__tear" aria-hidden="true" />
        <div className="coupon-card__body">
          {branchName && <span className="coupon-card__scope">{branchName}</span>}
          <p className="coupon-card__value">{discountLabel}</p>
          <h3 className="coupon-card__title">{campaign.title}</h3>
          {campaign.description && !compact && (
            <p className="coupon-card__desc">{campaign.description}</p>
          )}
          {campaign.minOrder > 0 && (
            <p className="coupon-card__min">
              {t("coupons.minOrder", { amount: campaign.minOrder.toFixed(2).replace(".", ",") })}
            </p>
          )}
          <span className="coupon-card__cta coupon-card__cta--locked">{t("coupons.alwaysActive")}</span>
        </div>
      </div>
    )
  }

  return null
}
