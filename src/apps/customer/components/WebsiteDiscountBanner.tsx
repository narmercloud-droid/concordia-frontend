import React from "react"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/utils/format"

type Props = {
  percent: number
  amount: number
  compact?: boolean
}

export default function WebsiteDiscountBanner({ percent, amount, compact = false }: Props) {
  const { t } = useTranslation()

  return (
    <div
      className={`website-discount-banner${compact ? " website-discount-banner--compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="website-discount-banner__badge" aria-hidden="true">
        −{percent}%
      </div>
      <div className="website-discount-banner__body">
        <p className="website-discount-banner__title">
          {t("cart.discountYouSave", { amount: formatCurrency(amount) })}
        </p>
        <p className="website-discount-banner__detail">
          {t("home.websiteDiscountDetail")}
        </p>
      </div>
      <span className="website-discount-banner__tag">{t("home.websiteDiscountBadge")}</span>
    </div>
  )
}
