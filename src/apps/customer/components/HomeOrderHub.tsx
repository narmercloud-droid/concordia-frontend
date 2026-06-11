import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { branchPath } from "@/lib/customerPaths"

export type HomeBranch = {
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

type Props = {
  branches: HomeBranch[]
  primary?: boolean
}

function branchDisplayName(name?: string | null) {
  return String(name ?? "").replace(/^Concordia\s+/i, "")
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 10) / 10} km`
  return `${km.toFixed(1)} km`
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

type FilterKey = "open" | "delivery" | "pickup"
type LocationState = "idle" | "loading" | "ready" | "denied" | "unsupported"

function sortByDistance(list: HomeBranch[], distances: Record<string, number>) {
  return [...list].sort((a, b) => {
    const da = distances[a.id]
    const db = distances[b.id]
    if (da == null && db == null) return 0
    if (da == null) return 1
    if (db == null) return -1
    return da - db
  })
}

export default function HomeOrderHub({ branches, primary = false }: Props) {
  const safeBranches = Array.isArray(branches) ? branches : []
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set())
  const [nearestId, setNearestId] = useState<string | null>(null)
  const [distances, setDistances] = useState<Record<string, number>>({})
  const [locationState, setLocationState] = useState<LocationState>("idle")

  const liveBranches = useMemo(
    () => safeBranches.filter((b) => !b.comingSoon),
    [safeBranches]
  )
  const nearestBranch = liveBranches.find((b) => b.id === nearestId)

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

        liveBranches.forEach((b) => {
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

  const toggleFilter = (key: FilterKey) => {
    setFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const resetFilters = () => {
    setQuery("")
    setFilters(new Set())
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return safeBranches.filter((b) => {
      if (q) {
        const hay = [b.name, b.city, b.postalCode, b.address].filter(Boolean).join(" ").toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (b.comingSoon) return true
      if (filters.has("open") && !b.isOpen) return false
      if (filters.has("delivery") && b.supportsDelivery === false) return false
      if (filters.has("pickup") && b.supportsPickup === false) return false
      return true
    })
  }, [safeBranches, query, filters])

  const sorted = useMemo(() => {
    const live = filtered.filter((b) => !b.comingSoon)
    const soon = filtered.filter((b) => b.comingSoon)
    return [...sortByDistance(live, distances), ...sortByDistance(soon, distances)]
  }, [filtered, distances])

  return (
    <section
      className={`home-order-hub${primary ? " home-order-hub--primary" : ""}`}
      id="order"
    >
      <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
      <p className="home-order-hub__lead">{t("home.orderLead")}</p>

      <div className="home-order-hub__toolbar">
        <input
          type="search"
          id="branch-search"
          name="branchSearch"
          className="home-order-hub__search"
          placeholder={t("home.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("home.searchPlaceholder")}
        />
        <div className="home-order-hub__filters">
          <button
            type="button"
            className={`home-order-hub__chip${filters.has("open") ? " home-order-hub__chip--on" : ""}`}
            onClick={() => toggleFilter("open")}
          >
            {t("home.filterOpen")}
          </button>
          <button
            type="button"
            className={`home-order-hub__chip${filters.has("delivery") ? " home-order-hub__chip--on" : ""}`}
            onClick={() => toggleFilter("delivery")}
          >
            {t("home.filterDelivery")}
          </button>
          <button
            type="button"
            className={`home-order-hub__chip${filters.has("pickup") ? " home-order-hub__chip--on" : ""}`}
            onClick={() => toggleFilter("pickup")}
          >
            {t("home.filterPickup")}
          </button>
          {(query || filters.size > 0) && (
            <button type="button" className="home-order-hub__reset" onClick={resetFilters}>
              {t("home.filterReset")}
            </button>
          )}
        </div>
      </div>

      <div className="home-order-hub__location">
        {locationState === "idle" && (
          <div className="home-location-prompt home-location-prompt--hub">
            <button type="button" className="home-location-retry" onClick={detectNearest}>
              {t("home.useLocation")}
            </button>
          </div>
        )}
        {locationState === "loading" && (
          <p className="home-location-hint">{t("home.findingNearest")}</p>
        )}
        {locationState === "ready" && nearestBranch && nearestId && (
          <div className="home-nearest-banner home-nearest-banner--hub">
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
              className="home-cta home-cta--compact"
              onClick={() => navigate(branchPath(nearestId))}
            >
              {t("home.orderHere")}
            </button>
          </div>
        )}
        {(locationState === "denied" || locationState === "unsupported") && (
          <div className="home-location-prompt home-location-prompt--hub">
            <p>{t("home.locationDenied")}</p>
            <button type="button" className="home-location-retry" onClick={detectNearest}>
              {t("home.useLocation")}
            </button>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="home-order-hub__empty">{t("home.noBranches")}</p>
      ) : (
        <div className="home-branches">
          {sorted.map((b) => (
            <article
              key={b.id}
              className={`home-branch-card${b.id === nearestId ? " home-branch-card--nearest" : ""}${
                b.comingSoon ? " home-branch-card--soon" : ""
              }`}
            >
              <div className="home-branch-accent" aria-hidden="true" />
              <div className="home-branch-body">
                <div>
                  <div className="home-branch-name-row">
                    <h3 className="home-branch-name">{branchDisplayName(b.name)}</h3>
                    {b.comingSoon ? (
                      <span className="home-branch-soon-badge">{t("home.comingSoonLabel")}</span>
                    ) : (
                      b.id === nearestId &&
                      distances[b.id] != null && (
                        <span className="home-nearest-badge">
                          {t("home.nearestBadge")} · {formatDistance(distances[b.id])}
                        </span>
                      )
                    )}
                  </div>
                  {(b.address || b.city) && (
                    <p className="home-branch-address">
                      {[b.address, [b.postalCode, b.city].filter(Boolean).join(" ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {!b.comingSoon && (
                    <div className="home-branch-tags">
                      <p
                        className={`home-status ${b.isOpen ? "home-status--open" : "home-status--closed"}`}
                      >
                        <span className="home-status-dot" aria-hidden="true" />
                        {b.isOpen ? t("home.openNow") : t("home.closed")}
                      </p>
                      {b.supportsDelivery !== false && (
                        <span className="home-branch-tag">{t("checkout.delivery")}</span>
                      )}
                      {b.supportsPickup !== false && (
                        <span className="home-branch-tag">{t("checkout.pickup")}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="home-branch-actions">
                  {b.comingSoon ? (
                    <span className="home-branch-btn home-branch-btn--soon">{t("home.comingSoonLabel")}</span>
                  ) : (
                    <button
                      type="button"
                      className="home-branch-btn home-branch-btn--primary"
                      onClick={() => navigate(branchPath(b.id))}
                    >
                      {t("home.orderNow")}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
