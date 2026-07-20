import React, { Suspense, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import HomeHeroMotion from "@/apps/customer/components/HomeHeroMotion"
import HomeOrderHub, { type HomeBranch } from "@/apps/customer/components/HomeOrderHub"
import HomeReviewSnippet from "@/apps/customer/components/HomeReviewSnippet"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import CouponSignupPromo from "@/apps/customer/components/CouponSignupPromo"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import SiteFooter from "@/apps/customer/components/SiteFooter"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"
import "./HomePage.css"

const HomeFeaturedMenu = React.lazy(
  () => import("@/apps/customer/components/HomeFeaturedMenu")
)
const MenuShowcase = React.lazy(() => import("@/apps/customer/components/MenuShowcase"))

export default function HomePage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { data, isLoading, isError, isFetching, isPending, refetch } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branches = (Array.isArray(data) ? data : []) as HomeBranch[]

  useEffect(() => {
    if (!isError || branches.length || isFetching || isPending) return
    const timer = window.setTimeout(() => void refetch(), 2500)
    return () => window.clearTimeout(timer)
  }, [isError, branches.length, isFetching, isPending, refetch])

  useEffect(() => {
    if (location.hash !== "#order") return
    const timer = window.setTimeout(() => scrollToBranchChoice(), 80)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  const branchesLoading = !branches.length && (isLoading || isFetching || isPending)
  const branchesFailed = isError && !isFetching && !isPending && !branches.length

  const orderHub = branchesLoading ? (
      <section className="home-order-hub home-order-hub--primary home-order-hub--loading" id="order">
        <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
        <p className="home-order-hub__empty">{t("home.branchesLoading")}</p>
      </section>
    ) : branchesFailed ? (
      <section className="home-order-hub home-order-hub--primary home-order-hub--error" id="order">
        <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
        <p className="home-order-hub__empty">{t("home.branchesLoadError")}</p>
        <button type="button" className="home-cta" onClick={() => refetch()}>
          {t("home.retry")}
        </button>
      </section>
    ) : (
      <HomeOrderHub branches={branches} primary />
    )

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__stack">
          <HomeHeroMotion />
          <div className="home-hero__overlay" aria-hidden="true" />

          <div className="home-hero__stack-content">
            <div className="home-hero__intro-content">
              <div className="home-hero__welcome-block">
                <p className="home-hero__eyebrow">{t("home.eyebrow")}</p>
                <h2 className="home-hero__name" aria-label={t("home.welcomePizzeria")}>
                  <span className="home-hero__name-pizzeria">{t("home.pizzeria")}</span>{" "}
                  <span className="home-hero__name-brand">{t("common.brand")}</span>
                </h2>
                <p className="home-hero__tagline">
                  {t("home.tagline")
                    .split(/\s*•\s*/)
                    .map((part, index) => (
                      <React.Fragment key={index}>
                        {index > 0 ? (
                          <span className="home-hero__tagline-sep" aria-hidden="true">
                            ·
                          </span>
                        ) : null}
                        <span>{part}</span>
                      </React.Fragment>
                    ))}
                </p>
              </div>
              <div className="home-divider" aria-hidden="true" />
              <p className="home-lead">{t("home.lead")}</p>
            </div>

            <div className="home-hero__panel">
              <div className="home-hero__promo" aria-label={t("home.websiteDiscountBadge")}>
                <span className="home-hero__promo-percent">{WEBSITE_ORDER_DISCOUNT_PCT}%</span>
                <div className="home-hero__promo-copy">
                  <p className="home-hero__promo-title">{t("home.websiteDiscountStrip")}</p>
                  <p className="home-hero__promo-detail">{t("home.websiteDiscountDetail")}</p>
                </div>
                <OrderNowLink className="home-hero__promo-cta">{t("home.orderNow")}</OrderNowLink>
              </div>

              <div className="home-hero__reviews home-hero__reviews--compact">
                <HomeReviewSnippet compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {orderHub}

      <div className="home-coupon-promo-wrap">
        <CouponSignupPromo variant="home" />
      </div>

      <Suspense fallback={null}>
        <HomeFeaturedMenu branchId={null} />
      </Suspense>

      <Suspense fallback={null}>
        <MenuShowcase />
      </Suspense>

      <SiteFooter />
    </div>
  )
}
