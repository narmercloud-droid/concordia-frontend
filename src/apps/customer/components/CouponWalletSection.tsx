import React from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { activateCoupon, formatCouponDiscount, listMyCoupons } from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"

type Props = {
  branchId: string
  id?: string
}

export default function CouponWalletSection({ branchId, id = "wallet" }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isLoggedIn = !!useAuthStore((s) => s.token)

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["customerCoupons", branchId],
    queryFn: () => listMyCoupons(branchId),
    enabled: isLoggedIn && !!branchId
  })

  const activateMutation = useMutation({
    mutationFn: (customerCouponId: string) => activateCoupon(customerCouponId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customerCoupons", branchId] })
      void queryClient.invalidateQueries({ queryKey: ["couponCampaigns", branchId] })
    }
  })

  if (!isLoggedIn) {
    return (
      <section id={id} className="coupon-page__section offers-wallet-guest">
        <p className="customer-alert customer-alert--info">
          {t("coupons.loginHint")}{" "}
          <Link to={`/customer/register?branchId=${branchId}&redirect=${encodeURIComponent(`/offers?branchId=${branchId}#wallet`)}`}>
            {t("auth.register")}
          </Link>
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
            <li
              key={coupon.id}
              className={`coupon-wallet__item${coupon.status === "activated" ? " coupon-wallet__item--active" : ""}`}
            >
              <div className="coupon-wallet__main">
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
                <div className="coupon-wallet__code-row">
                  <span className="coupon-wallet__code-label">{t("coupons.activationCode")}</span>
                  <span className="coupon-wallet__code">{coupon.claimCode}</span>
                </div>
              </div>
              <div className="coupon-wallet__actions">
                <span
                  className={`coupon-wallet__status coupon-wallet__status--${coupon.status}`}
                >
                  {t(`coupons.status.${coupon.status}`, { defaultValue: coupon.status })}
                </span>
                {coupon.status === "available" && (
                  <button
                    type="button"
                    className="coupon-wallet__activate"
                    disabled={activateMutation.isPending}
                    onClick={() => activateMutation.mutate(coupon.id)}
                  >
                    {t("coupons.tapToActivate")}
                  </button>
                )}
              </div>
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
