import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import { branchPath } from "@/lib/customerPaths"
import "./HomePage.css"

type Branch = {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  comingSoon?: boolean
  isOpen?: boolean
  lat?: number
  lng?: number
}

const MENU_HIGHLIGHTS = ["Pizza", "Pasta", "Salate", "Al Forno", "Schnitzel"]

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
  const { data, isLoading } = useQuery({ queryKey: ["branches"], queryFn: getBranches })
  const [nearestId, setNearestId] = useState<string | null>(null)
  const [distances, setDistances] = useState<Record<string, number>>({})
  const [locationState, setLocationState] = useState<LocationState>("idle")

  const branches = (data ?? []).filter((b: Branch) => b.id !== "branch-001")
  const liveBranches = branches.filter((b) => !b.comingSoon)
  const comingSoon = branches.filter((b) => b.comingSoon)

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

  const sortedLiveBranches = [...liveBranches].sort((a, b) => {
    const da = distances[a.id]
    const db = distances[b.id]
    if (da == null && db == null) return 0
    if (da == null) return 1
    if (db == null) return -1
    return da - db
  })

  const nearestBranch = liveBranches.find((b) => b.id === nearestId)

  if (isLoading) {
    return (
      <div className="home-loading">
        <ConcordiaLogo size="lg" className="home-loading__logo" />
        <p>{t("home.loading")}</p>
      </div>
    )
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__glow home-hero__glow--left" aria-hidden="true" />
        <div className="home-hero__glow home-hero__glow--right" aria-hidden="true" />

        <div className="home-hero__brand">
          <ConcordiaLogo size="hero" className="home-hero__logo" />
        </div>

        <p className="home-eyebrow">{t("home.eyebrow")}</p>
        <div className="home-divider" aria-hidden="true" />
        <p className="home-lead">{t("home.lead")}</p>

        <ul className="home-highlights" aria-label="Menu highlights">
          {MENU_HIGHLIGHTS.map((item) => (
            <li key={item} className="home-highlight">
              {item}
            </li>
          ))}
        </ul>

        <div className="home-perks">
          <span className="home-perk">{t("checkout.delivery")}</span>
          <span className="home-perk">{t("checkout.pickup")}</span>
          <span className="home-perk home-perk--accent">{t("home.footerFreeDrink")}</span>
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
            <button
              type="button"
              className="home-cta"
              onClick={() => navigate(branchPath(nearestId))}
            >
              {t("home.orderHere")}
            </button>
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
      </section>

      <section className="home-locations">
        <p className="home-section-label">{t("home.locationsLabel")}</p>
        <h2 className="home-section-title">{t("home.chooseRestaurant")}</h2>

        <div className="home-branches">
          {sortedLiveBranches.map((b: Branch) => (
            <article
              key={b.id}
              className={`home-branch-card${b.id === nearestId ? " home-branch-card--nearest" : ""}`}
            >
              <div className="home-branch-accent" aria-hidden="true" />
              <div className="home-branch-body">
                <div>
                  <div className="home-branch-name-row">
                    <h3 className="home-branch-name">{branchDisplayName(b.name)}</h3>
                    {b.id === nearestId && distances[b.id] != null && (
                      <span className="home-nearest-badge">
                        {t("home.nearestBadge")} · {formatDistance(distances[b.id])}
                      </span>
                    )}
                  </div>
                  {(b.address || b.city) && (
                    <p className="home-branch-address">
                      {[b.address, [b.postalCode, b.city].filter(Boolean).join(" ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <p
                    className={`home-status ${b.isOpen ? "home-status--open" : "home-status--closed"}`}
                  >
                    <span className="home-status-dot" aria-hidden="true" />
                    {b.isOpen ? t("home.openNow") : t("home.closed")}
                  </p>
                </div>
                <button
                  type="button"
                  className="home-branch-btn"
                  onClick={() => navigate(branchPath(b.id))}
                >
                  {t("home.viewMenu")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section className="home-coming">
          <p className="home-section-label">{t("home.comingSoonLabel")}</p>
          <h2 className="home-section-title">{t("home.moreLocations")}</h2>
          <div className="home-coming-grid">
            {comingSoon.map((b: Branch) => (
              <div key={b.id} className="home-coming-card">
                <h3>{branchDisplayName(b.name)}</h3>
                {b.city && <p>{b.city}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="home-footer">
        <ConcordiaLogo size="sm" className="home-footer__logo" />
        <p>{t("home.footerCash")}</p>
        <p>{t("home.footerFreeDrink")}</p>
      </footer>
    </div>
  )
}
