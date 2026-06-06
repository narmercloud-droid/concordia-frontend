import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getBranches } from "@/api/customer"
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

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ["branches"], queryFn: getBranches })
  const [nearest, setNearest] = useState<string | null>(null)

  const branches = (data ?? []).filter((b: Branch) => b.id !== "branch-001")
  const liveBranches = branches.filter((b) => !b.comingSoon)
  const comingSoon = branches.filter((b) => b.comingSoon)

  useEffect(() => {
    if (!navigator.geolocation || !branches.length) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

        let closest: string | null = null
        let minDist = Infinity

        branches.forEach((b: Branch) => {
          if (b.comingSoon || !b.lat || !b.lng) return
          const dist = haversine(pos.coords.latitude, pos.coords.longitude, b.lat, b.lng)
          if (dist < minDist) {
            minDist = dist
            closest = b.id
          }
        })

        setNearest(closest)
      },
      () => setNearest(null)
    )
  }, [branches.length])

  if (isLoading) {
    return <p className="home-loading">Concordia</p>
  }

  return (
    <div className="home">
      <section className="home-hero">
        <p className="home-eyebrow">Willkommen</p>
        <h1 className="home-title">Concordia Restaurant</h1>
        <div className="home-divider" aria-hidden="true" />
        <p className="home-lead">
          Authentic Italian cuisine — wood-fired pizza, fresh pasta, and timeless
          recipes. Order for pickup or delivery at your local branch.
        </p>

        {nearest && (
          <button
            type="button"
            className="home-cta"
            onClick={() => navigate(branchPath(nearest))}
          >
            Order from nearest branch
          </button>
        )}
      </section>

      <section>
        <p className="home-section-label">Standorte</p>
        <h2 className="home-section-title">Choose your restaurant</h2>

        <div className="home-branches">
          {liveBranches.map((b: Branch) => (
            <article key={b.id} className="home-branch-card">
              <div className="home-branch-accent" aria-hidden="true" />
              <div className="home-branch-body">
                <div>
                  <h3 className="home-branch-name">{branchDisplayName(b.name)}</h3>
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
                    {b.isOpen ? "Open now" : "Closed"}
                  </p>
                </div>
                <button
                  type="button"
                  className="home-branch-btn"
                  onClick={() => navigate(branchPath(b.id))}
                >
                  View menu
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section className="home-coming">
          <p className="home-section-label">Bald verfügbar</p>
          <h2 className="home-section-title">More locations on the way</h2>
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
        Cash on pickup or delivery
        <br />
        Free drink on orders from €35
      </footer>
    </div>
  )
}
