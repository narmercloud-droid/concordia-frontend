import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBranches } from "@/api/customer"
import { useNavigate } from "react-router-dom"

export default function BranchListPage() {
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ["branches"], queryFn: getBranches })
  const [nearest, setNearest] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude

        if (!data?.length) return

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

        let closest = null
        let minDist = Infinity

        data.forEach((b: any) => {
          const dist = haversine(userLat, userLng, b.lat, b.lng)
          if (dist < minDist) {
            minDist = dist
            closest = b.id
          }
        })

        setNearest(closest)
      },
      () => setNearest(null)
    )
  }, [data])

  if (!data) return <p>Loading...</p>

  return (
    <div>
      <h2>Select a Branch</h2>

      {nearest === null && (
        <p>Location unavailable — please select a branch manually.</p>
      )}
      {nearest && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(`/customer/branch/${nearest}`)}
            style={{ padding: "10px 20px", fontSize: 16 }}
          >
            Go to Nearest Branch
          </button>
        </div>
      )}

      {data.filter((b: any) => b.id !== "branch-001").map((b: any) => (
        <div
          key={b.id}
          style={{ padding: 12, border: "1px solid #ccc", marginBottom: 12, opacity: b.comingSoon ? 0.6 : 1 }}
        >
          <h3>{b.name}</h3>
          {b.address && <p>{b.address}{b.city ? `, ${b.city}` : ""}</p>}
          {b.comingSoon ? (
            <p>Coming soon</p>
          ) : (
            <p>Status: {b.isOpen ? "Open now" : "Closed"}</p>
          )}
          <button
            disabled={b.comingSoon}
            onClick={() => navigate(`/customer/branch/${b.id}`)}
          >
            {b.comingSoon ? "Coming Soon" : "View Menu"}
          </button>
        </div>
      ))}
    </div>
  )
}
