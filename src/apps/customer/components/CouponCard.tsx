import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type CouponCampaign,
  claimCouponCampaign,
  activateCoupon,
  deactivateCoupon,
  formatCouponDiscount
} from "@/api/coupons"
import { useAuthStore } from "@/context/authStore"

type Props = {
  campaign: CouponCampaign
  branchId: string
  compact?: boolean
  branchName?: string
  onClaimed?: () => void
}

export default function CouponCard({
  campaign,
  branchId,
  compact,
  branchName,
  onClaimed
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isLoggedIn = !!useAuthStore((s) => s.token)
  const [error, setError] = useState("")
  const [localCode, setLocalCode] = useState<string | null>(null)

  const alwaysActive = Boolean(campaign.alwaysActive) || isPlatformPerk(campaign)
  const isActivated = alwaysActive || campaign.status === "activated"
  const isClaimed = campaign.claimed && !isActivated

  const discountLabel = formatCouponDiscount(
    campaign.discountType,
    campaign.discountValue,
    t
  )

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["customerCoupons", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["couponCampaigns", branchId] })
    void queryClient.invalidateQueries({ queryKey: ["cartCouponPreview", branchId] })
  }

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        const params = new URLSearchParams()
        params.set("redirect", `/offers?branchId=${branchId}#coupons`)
        params.set("branchId", branchId)
        params.set("campaignId", campaign.id)
        navigate(`/customer/register?${params.toString()}`)
        return null
      }
      const claimed = await claimCouponCampaign(campaign.id, branchId)
      const activated = await activateCoupon(claimed.id)
      return { ...claimed, claimCode: activated.claimCode ?? claimed.claimCode, status: "activated" }
    },
    onSuccess: (result) => {
      if (!result) return
      setLocalCode(result.claimCode)
      invalidate()
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

  const activateMutation = useMutation({
    mutationFn: async (customerCouponId: string) => activateCoupon(customerCouponId),
    onSuccess: (result) => {
      setLocalCode(result.claimCode)
      invalidate()
      onClaimed?.()
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("coupons.activateFailed")
      setError(message)
    }
  })

  const deactivateMutation = useMutation({
    mutationFn: async (customerCouponId: string) => deactivateCoupon(customerCouponId),
    onSuccess: () => {
      invalidate()
      onClaimed?.()
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("coupons.activateFailed")
      setError(message)
    }
  })

  const handleClick = () => {
    if (alwaysActive) return
    setError("")
    if (!isLoggedIn) {
      claimMutation.mutate()
      return
    }
    if (isActivated && campaign.customerCouponId) {
      deactivateMutation.mutate(campaign.customerCouponId)
      return
    }
    if (isClaimed && campaign.customerCouponId) {
      activateMutation.mutate(campaign.customerCouponId)
      return
    }
    claimMutation.mutate()
  }

  const busy =
    claimMutation.isPending || activateMutation.isPending || deactivateMutation.isPending

  let statusLabel = t("coupons.tapToClaim")
  if (alwaysActive || isActivated) {
    statusLabel = t("coupons.status.activated")
  } else if (isLoggedIn && isClaimed) {
    statusLabel = t("coupons.tapToActivate")
  }

  const displayCode =
    localCode ?? (isActivated || isClaimed ? campaign.claimCode : null)

  const cardClass = [
    "coupon-card",
    compact ? "coupon-card--compact" : "",
    alwaysActive ? "coupon-card--platform" : "",
    isActivated && !alwaysActive ? "coupon-card--activated" : "",
    isClaimed ? "coupon-card--claimed" : ""
  ]
    .filter(Boolean)
    .join(" ")

  const Wrapper = alwaysActive ? "div" : "button"

  return (
    <Wrapper
      type={alwaysActive ? undefined : "button"}
      className={cardClass}
      onClick={alwaysActive ? undefined : handleClick}
      disabled={alwaysActive ? undefined : busy}
      aria-label={campaign.title}
    >
      <div className="coupon-card__header">
        {branchName && <span className="coupon-card__scope">{branchName}</span>}
        <span
          className={`coupon-card__status${
            isActivated || alwaysActive ? " coupon-card__status--on" : ""
          }`}
        >
          {busy ? t("common.processing") : statusLabel}
        </span>
      </div>

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

      {displayCode && !alwaysActive && (isActivated || isClaimed || localCode) && (
        <div className="coupon-card__code-block">
          <span className="coupon-card__code-label">{t("coupons.activationCode")}</span>
          <span className="coupon-card__code">{displayCode}</span>
        </div>
      )}

      {!alwaysActive && isActivated && isLoggedIn && (
        <span className="coupon-card__hint">{t("coupons.tapToDeactivate")}</span>
      )}

      {error && <span className="coupon-card__error">{error}</span>}
    </Wrapper>
  )
}

function isPlatformPerk(campaign: CouponCampaign) {
  return Boolean(campaign.alwaysActive) || campaign.id.startsWith("platform:")
}
