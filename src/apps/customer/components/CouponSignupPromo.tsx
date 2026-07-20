import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/context/authStore"

type Props = {
  branchId?: string | null
  /** Where the promo sits — tweaks copy density */
  variant?: "home" | "menu" | "cart" | "checkout"
  className?: string
}

export default function CouponSignupPromo({
  branchId,
  variant = "menu",
  className = ""
}: Props) {
  const { t } = useTranslation()
  const isLoggedIn = !!useAuthStore((s) => s.token)

  if (isLoggedIn) return null

  const offersPath = branchId
    ? `/offers?branchId=${encodeURIComponent(branchId)}#coupons`
    : "/offers#coupons"
  const registerPath = `/customer/register?redirect=${encodeURIComponent(offersPath)}${
    branchId ? `&branchId=${encodeURIComponent(branchId)}` : ""
  }`

  const titleKey =
    variant === "home"
      ? "coupons.promoHomeTitle"
      : variant === "cart" || variant === "checkout"
        ? "coupons.promoCheckoutTitle"
        : "coupons.promoMenuTitle"

  const textKey =
    variant === "home"
      ? "coupons.promoHomeText"
      : variant === "cart" || variant === "checkout"
        ? "coupons.promoCheckoutText"
        : "coupons.promoMenuText"

  return (
    <aside
      className={`coupon-signup-promo coupon-signup-promo--${variant}${className ? ` ${className}` : ""}`}
      aria-label={t("coupons.promoAria")}
    >
      <div className="coupon-signup-promo__badge" aria-hidden="true">
        %
      </div>
      <div className="coupon-signup-promo__body">
        <p className="coupon-signup-promo__title">{t(titleKey)}</p>
        <p className="coupon-signup-promo__text">{t(textKey)}</p>
        <div className="coupon-signup-promo__actions">
          <Link to={registerPath} className="coupon-signup-promo__cta">
            {t("coupons.promoRegisterCta")}
          </Link>
          <Link to={offersPath} className="coupon-signup-promo__link">
            {t("coupons.promoSeeOffers")}
          </Link>
        </div>
      </div>
    </aside>
  )
}
