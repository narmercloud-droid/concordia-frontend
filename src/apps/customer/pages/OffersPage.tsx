import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OfferNotificationsPrompt from "@/apps/customer/components/OfferNotificationsPrompt"
import AppDownloadSection from "@/apps/customer/components/AppDownloadSection"
import BranchCouponTabs, {
  useDefaultCouponBranch
} from "@/apps/customer/components/BranchCouponTabs"
import CouponCampaignStrip from "@/apps/customer/components/CouponCampaignStrip"
import { branchPath } from "@/lib/customerPaths"
import { useSelectedBranch } from "@/hooks/useSelectedBranch"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { isNativeApp } from "@/lib/nativeApp"

const STEP_KEYS = ["step1", "step2", "step3"] as const

function branchShortName(name: string) {
  return name.replace(/^Concordia\s+/i, "").replace(/^Pizzeria\s+/i, "")
}

export default function OffersPage() {
  const { t } = useTranslation()
  const defaultBranch = useDefaultCouponBranch()
  const { branchId: resolvedBranchId, setBranchId } = useSelectedBranch()
  const activeBranchId = resolvedBranchId ?? defaultBranch

  const { data: branches } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const activeBranch = useMemo(
    () =>
      (Array.isArray(branches) ? branches : []).find(
        (b: { id: string }) => b.id === activeBranchId
      ),
    [branches, activeBranchId]
  )

  const branchName = activeBranch?.name ? branchShortName(activeBranch.name) : activeBranchId

  const selectBranch = (branchId: string) => {
    setBranchId(branchId)
  }

  return (
    <InfoPageShell eyebrow={t("pages.offers.eyebrow")} title={t("pages.offers.title")}>
      <OfferNotificationsPrompt />
      <p className="offers-lead">{t("pages.offers.lead")}</p>

      <BranchCouponTabs branchId={activeBranchId} onSelect={selectBranch} />

      {activeBranch && (
        <p className="customer-hint offers-branch-note">
          {t("pages.offers.branchNote", { branch: branchName })}
        </p>
      )}

      <div id="coupons">
        <CouponCampaignStrip
          branchId={activeBranchId}
          branchName={branchName}
          title={t("coupons.activeOffersTitle")}
          showViewAll={false}
        />
        <p className="customer-hint customer-alert customer-alert--success" style={{ marginTop: 16 }}>
          {t("coupons.checkoutAutoHint")}
        </p>
      </div>

      <div className="offers-secondary">
        <article className="offers-card offers-card--gift">
          <div className="offers-card__body offers-card__body--plain">
            <span className="offers-card__badge offers-card__badge--gold">
              {t("pages.offers.giftBadge")}
            </span>
            <h2 className="offers-card__title">{t("pages.offers.giftTitle")}</h2>
            <p>{t("pages.offers.giftText")}</p>
            <Link
              to={`/gutschein/${activeBranchId}`}
              className="info-cta"
              style={{ marginTop: 12, display: "inline-block" }}
            >
              {t("pages.offers.giftCta")}
            </Link>
          </div>
        </article>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.offers.howTitle")}</h2>
        <div className="offers-steps">
          {STEP_KEYS.map((key, index) => (
            <div key={key} className="offers-step">
              <span className="offers-step__num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{t(`pages.offers.${key}Title`)}</h3>
                <p>{t(`pages.offers.${key}Text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isNativeApp() && <AppDownloadSection />}

      <section className="offers-cta-banner offers-cta-banner--plain">
        <div className="offers-cta-banner__copy">
          <p className="offers-cta-banner__note">{t("pages.offers.promoNote")}</p>
          <Link to={branchPath(activeBranchId)} className="info-cta">
            {t("home.orderNow")}
          </Link>
        </div>
      </section>
    </InfoPageShell>
  )
}
