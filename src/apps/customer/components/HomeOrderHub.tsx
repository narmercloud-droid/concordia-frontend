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
  nearestId: string | null
  distances: Record<string, number>
}

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 10) / 10} km`
  return `${km.toFixed(1)} km`
}

type FilterKey = "open" | "delivery" | "pickup"

export default function HomeOrderHub({ branches, nearestId, distances }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set())

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
    return branches.filter((b) => {
      if (q) {
        const hay = [b.name, b.city, b.postalCode, b.address].filter(Boolean).join(" ").toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.has("open") && !b.isOpen) return false
      if (filters.has("delivery") && b.supportsDelivery === false) return false
      if (filters.has("pickup") && b.supportsPickup === false) return false
      return true
    })
  }, [branches, query, filters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = distances[a.id]
      const db = distances[b.id]
      if (da == null && db == null) return 0
      if (da == null) return 1
      if (db == null) return -1
      return da - db
    })
  }, [filtered, distances])

  return (
    <section className="home-order-hub" id="order">
      <p className="home-order-hub__eyebrow">{t("home.eyebrow")}</p>
      <h2 className="home-order-hub__title">{t("home.chooseRestaurant")}</h2>
      <p className="home-order-hub__lead">{t("home.orderLead")}</p>

      <div className="home-order-hub__toolbar">
        <input
          type="search"
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

      {sorted.length === 0 ? (
        <p className="home-order-hub__empty">{t("home.noBranches")}</p>
      ) : (
        <div className="home-branches">
          {sorted.map((b) => (
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
                </div>
                <div className="home-branch-actions">
                  <button
                    type="button"
                    className="home-branch-btn home-branch-btn--primary"
                    onClick={() => navigate(branchPath(b.id))}
                  >
                    {t("home.orderNow")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
