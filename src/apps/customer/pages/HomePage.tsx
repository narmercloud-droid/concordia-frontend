import React, { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import ConcordiaHomeLogo from "@/apps/customer/components/ConcordiaHomeLogo"
import HomeOrderHub from "@/apps/customer/components/HomeOrderHub"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import SiteFooter from "@/apps/customer/components/SiteFooter"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import "./HomePage.css"

const HomeFeaturedMenu = React.lazy(
  () => import("@/apps/customer/components/HomeFeaturedMenu")
)
const MenuShowcase = React.lazy(() => import("@/apps/customer/components/MenuShowcase"))
const HomeGallery = React.lazy(() => import("@/apps/customer/components/HomeGallery"))

export default function HomePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: branchesQueryOptions.queryFn,
    ...branchesQueryOptions
  })

  const branches = data ?? []

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__logo-stage">
          <ConcordiaHomeLogo />
        </div>

        <div
          className="home-hero__intro"
          style={{ backgroundImage: `url(${FOOD_IMAGES.hero})` }}
        >
          <div className="home-hero__overlay" aria-hidden="true" />

          <p className="home-hero__kicker">{t("home.eyebrow")}</p>
          <p className="home-slogan">{t("home.slogan")}</p>
          <div className="home-divider" aria-hidden="true" />
          <p className="home-lead">{t("home.lead")}</p>

          <div className="home-promo-offer" role="note">
            <span className="home-promo-offer__badge">{t("home.websiteDiscountBadge")}</span>
            <div className="home-promo-offer__main">
              <span className="home-promo-offer__percent" aria-hidden="true">
                {WEBSITE_ORDER_DISCOUNT_PCT}%
              </span>
              <div className="home-promo-offer__copy">
                <p className="home-promo-offer__title">{t("home.websiteDiscountTitle")}</p>
                <p className="home-promo-offer__detail">{t("home.websiteDiscountDetail")}</p>
              </div>
            </div>
          </div>

          <div className="home-perks">
            <span className="home-perk">
              <span className="home-perk__dot" aria-hidden="true" />
              {t("checkout.delivery")}
            </span>
            <span className="home-perk">
              <span className="home-perk__dot" aria-hidden="true" />
              {t("checkout.pickup")}
            </span>
            <span className="home-perk home-perk--accent">
              <span className="home-perk__dot" aria-hidden="true" />
              {t("home.footerFreeDrink")}
            </span>
          </div>
        </div>
      </section>

      <section className="home-promo-strip" aria-label={t("home.websiteDiscountBadge")}>
        <div className="home-promo-strip__inner">
          <span className="home-promo-strip__percent">{WEBSITE_ORDER_DISCOUNT_PCT}%</span>
          <div className="home-promo-strip__copy">
            <p className="home-promo-strip__title">{t("home.websiteDiscountStrip")}</p>
            <p className="home-promo-strip__detail">{t("home.websiteDiscountDetail")}</p>
          </div>
          <a className="home-promo-strip__cta" href="#order">
            {t("home.orderNow")}
          </a>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeFeaturedMenu branchId={null} />
      </Suspense>

      <Suspense fallback={null}>
        <MenuShowcase />
      </Suspense>

      <Suspense fallback={null}>
        <HomeGallery />
      </Suspense>

      {isLoading || (isFetching && !data) ? (
        <section className="home-order-hub home-order-hub--loading" id="order">
          <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
          <p className="home-order-hub__empty">{t("home.branchesLoading")}</p>
        </section>
      ) : isError ? (
        <section className="home-order-hub home-order-hub--error" id="order">
          <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
          <p className="home-order-hub__empty">{t("home.branchesLoadError")}</p>
          <button type="button" className="home-cta" onClick={() => refetch()}>
            {t("home.retry")}
          </button>
        </section>
      ) : (
        <HomeOrderHub branches={branches} />
      )}

      <SiteFooter />
    </div>
  )
}
