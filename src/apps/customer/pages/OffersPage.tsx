import React, { useEffect, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OfferNotificationsPrompt from "@/apps/customer/components/OfferNotificationsPrompt"
import AppDownloadSection from "@/apps/customer/components/AppDownloadSection"
import { branchPath } from "@/lib/customerPaths"
import CouponCampaignStrip from "@/apps/customer/components/CouponCampaignStrip"
import CouponWalletSection from "@/apps/customer/components/CouponWalletSection"
import BranchCouponTabs, {
  useDefaultCouponBranch
} from "@/apps/customer/components/BranchCouponTabs"
import { useSelectedBranch } from "@/hooks/useSelectedBranch"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import { isNativeApp } from "@/lib/nativeApp"

const STEP_KEYS = ["step1", "step2", "step3"] as const

function branchShortName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

export default function OffersPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
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

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace("#", "")
    const el = document.getElementById(id)
    if (el) {
      window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }, [location.hash, activeBranchId])

  const selectBranch = (branchId: string) => {
    setBranchId(branchId)
    navigate(`/offers?branchId=${branchId}${location.hash || ""}`, { replace: true })
  }

  return (
    <InfoPageShell eyebrow={t("pages.offers.eyebrow")} title={t("pages.offers.title")}>
      <OfferNotificationsPrompt />
      <p className="offers-lead">{t("pages.offers.lead")}</p>

      <BranchCouponTabs branchId={activeBranchId} onSelect={selectBranch} />

      {activeBranch && (
        <p className="customer-hint offers-branch-note">
          {t("coupons.branchOffersNote", { branch: branchName })}
        </p>
      )}

      <CouponWalletSection branchId={activeBranchId} />

      <div id="coupons" className="offers-coupons-block">
        <h2 className="info-block__title">{t("pages.offers.couponsTitle")}</h2>
        <p className="customer-hint offers-coupons-block__lead">
          {t("pages.offers.couponsLead")}
        </p>
        <CouponCampaignStrip
          branchId={activeBranchId}
          branchName={branchName}
          title={t("coupons.sectionTitle")}
          showViewAll={false}
        />
      </div>

      <div className="offers-showcase">
        <article className="offers-card offers-card--discount">
          <div
            className="offers-card__bg"
            style={{ backgroundImage: `url(${FOOD_IMAGES.pizzaMargherita})` }}
            aria-hidden="true"
          />
          <div className="offers-card__overlay" aria-hidden="true" />
          <div className="offers-card__body">
            <span className="offers-card__badge">{t("home.websiteDiscountBadge")}</span>
            <p className="offers-card__percent" aria-hidden="true">
              {WEBSITE_ORDER_DISCOUNT_PCT}%
            </p>
            <h2 className="offers-card__title">{t("pages.offers.discountTitle")}</h2>
            <p>{t("pages.offers.discountText")}</p>
          </div>
        </article>

        <article className="offers-card offers-card--drink">
          <div className="offers-card__visual offers-card__visual--drink" aria-hidden="true">
            <span className="offers-card__drink-icon">🥤</span>
            <span className="offers-card__drink-tag">€35+</span>
          </div>
          <div className="offers-card__body offers-card__body--plain">
            <span className="offers-card__badge offers-card__badge--gold">
              {t("common.free")}
            </span>
            <h2 className="offers-card__title">{t("pages.offers.drinkTitle")}</h2>
            <p>{t("pages.offers.drinkText")}</p>
          </div>
        </article>
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

      <section
        className="offers-cta-banner"
        style={{ backgroundImage: `url(${FOOD_IMAGES.dining})` }}
      >
        <div className="offers-cta-banner__overlay" aria-hidden="true" />
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
