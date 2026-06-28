import React from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { formatCouponDiscount, listMyCoupons } from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"

type Props = {
  id?: string
}

export default function CouponWalletSection({ id = "wallet" }: Props) {
  const { t } = useTranslation()
  const isLoggedIn = !!useAuthStore((s) => s.token)

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["customerCoupons"],
    queryFn: () => listMyCoupons(),
    enabled: isLoggedIn
  })

  if (!isLoggedIn) {
    return (
      <section id={id} className="coupon-page__section offers-wallet-guest">
        <p className="customer-alert customer-alert--info">
          {t("coupons.loginHint")}{" "}
          <Link to="/customer/register?redirect=/offers%23coupons">{t("auth.register")}</Link>
        </p>
      </section>
    )
  }

  const wallet = walletData?.coupons ?? []

  return (
    <section id={id} className="coupon-page__section offers-wallet">
      <h2 className="coupon-page__section-title">{t("coupons.walletTitle")}</h2>
      {isLoading ? (
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
        <p className="customer-alert customer-alert--success">{t("coupons.checkoutHint")}</p>
      )}
    </section>
  )
}
