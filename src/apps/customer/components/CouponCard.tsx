import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type CouponCampaign,
  claimCouponCampaign,
  activateCoupon,
  formatCouponDiscount
} from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"

type Props = {
  campaign: CouponCampaign
  branchId?: string
  compact?: boolean
  onClaimed?: () => void
}

export default function CouponCard({ campaign, branchId, compact, onClaimed }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isLoggedIn = !!useAuthStore((s) => s.token)
  const [error, setError] = useState("")

  const discountLabel = formatCouponDiscount(
    campaign.discountType,
    campaign.discountValue,
    t
  )

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        const params = new URLSearchParams()
        params.set("redirect", `/offers${branchId ? `?branchId=${branchId}` : ""}#coupons`)
        if (branchId) params.set("branchId", branchId)
        params.set("campaignId", campaign.id)
        navigate(`/customer/register?${params.toString()}`)
        return null
      }
      const result = await claimCouponCampaign(campaign.id, branchId)
      if (result && !result.alreadyClaimed) {
        await activateCoupon(result.id)
      } else if (result?.id && campaign.status !== "activated") {
        await activateCoupon(result.id)
      }
      return result
    },
    onSuccess: (result) => {
      if (!result) return
      void queryClient.invalidateQueries({ queryKey: ["customerCoupons"] })
      void queryClient.invalidateQueries({ queryKey: ["couponCampaigns"] })
      onClaimed?.()
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("coupons.claimFailed")
      setError(message)
    }
  })

  const isActivated = campaign.status === "activated"
  const isClaimed = campaign.claimed && !isActivated
  const scopeLabel =
    campaign.scope === "platform" ? t("coupons.allBranches") : t("coupons.thisBranch")

  let actionLabel = t("coupons.tapToClaim")
  if (isLoggedIn && isActivated) actionLabel = t("coupons.activeInWallet")
  else if (isLoggedIn && isClaimed) actionLabel = t("coupons.tapToActivate")
  else if (isLoggedIn && campaign.claimed) actionLabel = t("coupons.inWallet")

  return (
    <button
      type="button"
      className={`coupon-card${compact ? " coupon-card--compact" : ""}${isActivated ? " coupon-card--active" : ""}`}
      onClick={() => {
        setError("")
        claimMutation.mutate()
      }}
      disabled={claimMutation.isPending || (isLoggedIn && isActivated)}
    >
      <div className="coupon-card__tear" aria-hidden="true" />
      <div className="coupon-card__body">
        <span className="coupon-card__scope">{scopeLabel}</span>
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
        {campaign.newCustomersOnly && (
          <span className="coupon-card__badge">{t("coupons.newCustomers")}</span>
        )}
        <span className="coupon-card__cta">
          {claimMutation.isPending ? t("common.processing") : actionLabel}
        </span>
        {error && <span className="coupon-card__error">{error}</span>}
      </div>
    </button>
  )
}
