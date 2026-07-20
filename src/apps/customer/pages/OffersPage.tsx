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
import CouponWalletSection from "@/apps/customer/components/CouponWalletSection"
import CouponSignupPromo from "@/apps/customer/components/CouponSignupPromo"
import { branchPath } from "@/lib/customerPaths"
import { useSelectedBranch } from "@/hooks/useSelectedBranch"
import { usePlatformPromo } from "@/hooks/usePlatformPromo"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { isNativeApp } from "@/lib/nativeApp"

const STEP_KEYS = ["step1", "step2", "step3"] as const
const FREE_DRINK_MIN = 35

function branchShortName(name: string) {
  return name.replace(/^Concordia\s+/i, "").replace(/^Pizzeria\s+/i, "")
}

export default function OffersPage() {
  const { t } = useTranslation()
  const defaultBranch = useDefaultCouponBranch()
  const { branchId: resolvedBranchId, setBranchId } = useSelectedBranch()
  const activeBranchId = resolvedBranchId ?? defaultBranch
  const platformPromo = usePlatformPromo()

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
  const discountPct = platformPromo.websiteOrderDiscountPct || 10

  const selectBranch = (branchId: string) => {
    setBranchId(branchId)
  }

  return (
    <InfoPageShell eyebrow={t("pages.offers.eyebrow")} title={t("pages.offers.title")}>
      <OfferNotificationsPrompt />
      <p className="offers-lead">{t("pages.offers.lead")}</p>

      <CouponSignupPromo branchId={activeBranchId} variant="home" />

      <BranchCouponTabs branchId={activeBranchId} onSelect={selectBranch} />

      {activeBranch && (
        <p className="customer-hint offers-branch-note">
          {t("pages.offers.branchNote", { branch: branchName })}
        </p>
      )}

      <section className="offers-hero" aria-label={t("pages.offers.heroAria")}>
        <article className="offers-hero-card offers-hero-card--discount">
          <div
            className="offers-hero-card__bg"
            style={{ backgroundImage: `url(${FOOD_IMAGES.pizzaMargherita})` }}
            aria-hidden="true"
          />
          <div className="offers-hero-card__overlay" aria-hidden="true" />
          <div className="offers-hero-card__content">
            <span className="offers-hero-card__pill">{t("pages.offers.autoBadge")}</span>
            <p className="offers-hero-card__percent" aria-hidden="true">
              −{discountPct}%
            </p>
            <h2 className="offers-hero-card__title">{t("pages.offers.discountTitle")}</h2>
            <p className="offers-hero-card__text">{t("pages.offers.discountText")}</p>
            <Link to={branchPath(activeBranchId)} className="offers-hero-card__cta">
              {t("home.orderNow")}
            </Link>
          </div>
        </article>

        <article className="offers-hero-card offers-hero-card--drink">
          <div className="offers-hero-card__drink-visual" aria-hidden="true">
            <span className="offers-hero-card__drink-icon">🥤</span>
            <span className="offers-hero-card__drink-min">€{FREE_DRINK_MIN}+</span>
          </div>
          <div className="offers-hero-card__content offers-hero-card__content--plain">
            <span className="offers-hero-card__pill offers-hero-card__pill--gold">
              {t("common.free")}
            </span>
            <h2 className="offers-hero-card__title">{t("pages.offers.drinkTitle")}</h2>
            <p className="offers-hero-card__text">{t("pages.offers.drinkText")}</p>
            <p className="offers-hero-card__fine">{t("pages.offers.drinkFine")}</p>
          </div>
        </article>
      </section>

      <div id="coupons">
        <CouponCampaignStrip
          branchId={activeBranchId}
          branchName={branchName}
          title={t("coupons.sectionTitle")}
          showViewAll={false}
        />
      </div>

      <CouponWalletSection branchId={activeBranchId} id="wallet" />

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
