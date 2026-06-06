import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getBranches } from "@/api/customer"
import { branchPath } from "@/lib/customerPaths"

type Branch = {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  comingSoon?: boolean
  isOpen?: boolean
}

const BRAND = "#c41e3a"

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

        branches.forEach((b: Branch & { lat?: number; lng?: number }) => {
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
    return <p style={{ textAlign: "center", padding: 40 }}>Loading...</p>
  }

  return (
    <div>
      <section
        style={{
          textAlign: "center",
          padding: "32px 16px 40px",
          background: "linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)",
          borderRadius: 16,
          marginBottom: 32
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: BRAND,
            fontWeight: 600
          }}
        >
          Willkommen bei
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 700, color: "#1a1a1a" }}>
          Concordia Restaurant
        </h1>
        <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 17, color: "#555", lineHeight: 1.5 }}>
          Pizza, Pasta & more — order online for pickup or delivery at your nearest branch.
        </p>

        {nearest && (
          <button
            type="button"
            onClick={() => navigate(branchPath(nearest))}
            style={{
              marginTop: 24,
              padding: "14px 28px",
              fontSize: 16,
              fontWeight: 600,
              background: BRAND,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer"
            }}
          >
            Order from nearest branch
          </button>
        )}
      </section>

      <section>
        <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>Our branches</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {liveBranches.map((b: Branch) => (
            <div
              key={b.id}
              style={{
                padding: 20,
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{b.name}</h3>
                  {(b.address || b.city) && (
                    <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                      {[b.address, b.postalCode, b.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 13,
                      color: b.isOpen ? "#2e7d32" : "#888",
                      fontWeight: 500
                    }}
                  >
                    {b.isOpen ? "Open now" : "Currently closed"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(branchPath(b.id))}
                  style={{
                    padding: "10px 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    background: BRAND,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  View menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 22, color: "#666" }}>Coming soon</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {comingSoon.map((b: Branch) => (
              <div
                key={b.id}
                style={{
                  padding: 16,
                  border: "1px dashed #ddd",
                  borderRadius: 12,
                  opacity: 0.75
                }}
              >
                <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>{b.name}</h3>
                {b.city && <p style={{ margin: 0, color: "#888", fontSize: 14 }}>{b.city}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <p style={{ marginTop: 40, textAlign: "center", fontSize: 13, color: "#999" }}>
        Cash payment on pickup or delivery · Free drink on orders from €35
      </p>
    </div>
  )
}
