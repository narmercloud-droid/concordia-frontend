import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import ConcordiaHomeLogo from "@/apps/customer/components/ConcordiaHomeLogo"
import HomeFeaturedMenu from "@/apps/customer/components/HomeFeaturedMenu"
import HomeGallery from "@/apps/customer/components/HomeGallery"
import HomeOrderHub from "@/apps/customer/components/HomeOrderHub"
import MenuShowcase from "@/apps/customer/components/MenuShowcase"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import { branchPath } from "@/lib/customerPaths"
import SiteFooter from "@/apps/customer/components/SiteFooter"
import { branchesQueryOptions } from "@/lib/branchesQuery"
import "./HomePage.css"

type Branch = {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  comingSoon?: boolean
  isOpen?: boolean
  supportsPickup?: boolean
  supportsDelivery?: boolean
  lat?: number
  lng?: number
}

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 10) / 10} km`
  return `${km.toFixed(1)} km`
}

type LocationState = "idle" | "loading" | "ready" | "denied" | "unsupported"

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    ...branchesQueryOptions
  })
  const [nearestId, setNearestId] = useState<string | null>(null)
  const [distances, setDistances] = useState<Record<string, number>>({})
  const [locationState, setLocationState] = useState<LocationState>("idle")

  const branches = (data ?? []).filter((b: Branch) => b.id !== "branch-001")
  const liveBranches = branches.filter((b) => !b.comingSoon)

  const detectNearest = () => {
    if (!navigator.geolocation) {
      setLocationState("unsupported")
      return
    }

    setLocationState("loading")

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextDistances: Record<string, number> = {}
        let closest: string | null = null
        let minDist = Infinity

        liveBranches.forEach((b: Branch) => {
          if (!b.lat || !b.lng) return
          const dist = haversineKm(
            pos.coords.latitude,
            pos.coords.longitude,
            b.lat,
            b.lng
          )
          nextDistances[b.id] = dist
          if (dist < minDist) {
            minDist = dist
            closest = b.id
          }
        })

        setDistances(nextDistances)
        setNearestId(closest)
        setLocationState(closest ? "ready" : "denied")
      },
      () => {
        setNearestId(null)
        setDistances({})
        setLocationState("denied")
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    )
  }

  useEffect(() => {
    if (!liveBranches.length) return
    detectNearest()
  }, [data])

  const nearestBranch = liveBranches.find((b) => b.id === nearestId)

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

        {locationState === "loading" && (
          <p className="home-location-hint">{t("home.findingNearest")}</p>
        )}

        {locationState === "ready" && nearestBranch && nearestId && (
          <div className="home-nearest-banner">
            <p className="home-nearest-label">{t("home.nearestLabel")}</p>
            <p className="home-nearest-name">
              {branchDisplayName(nearestBranch.name)}
              {distances[nearestId] != null && (
                <span className="home-nearest-distance">
                  {" "}
                  · {formatDistance(distances[nearestId])}
                </span>
              )}
            </p>
            <div className="home-hero__ctas">
              <button
                type="button"
                className="home-cta"
                onClick={() => navigate(branchPath(nearestId))}
              >
                {t("home.orderHere")}
              </button>
              <a className="home-cta home-cta--ghost" href="#order">
                {t("home.allLocations")}
              </a>
            </div>
          </div>
        )}

        {locationState === "denied" && (
          <div className="home-location-prompt">
            <p>{t("home.locationDenied")}</p>
            <button type="button" className="home-location-retry" onClick={detectNearest}>
              {t("home.useLocation")}
            </button>
          </div>
        )}
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

      <HomeFeaturedMenu branchId={nearestId} />

      <MenuShowcase />

      <HomeGallery />

      {isLoading || (isFetching && !data) ? (
        <section className="home-order-hub home-order-hub--loading" id="order">
          <p className="home-order-hub__eyebrow">{t("home.eyebrow")}</p>
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
        <HomeOrderHub
          branches={branches}
          nearestId={nearestId}
          distances={distances}
        />
      )}

      <SiteFooter />
    </div>
  )
}
