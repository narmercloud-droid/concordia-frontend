import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import { useNavigate } from "react-router-dom"
import { branchPath } from "@/lib/customerPaths"

export default function BranchListPage() {
  const { t } = useTranslation()
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

  if (!data) return <p className="customer-loading">{t("common.loading")}</p>

  return (
    <div>
      <h2>{t("home.chooseRestaurant")}</h2>

      {nearest === null && (
        <p>{t("home.locationDenied")}</p>
      )}
      {nearest && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(branchPath(nearest))}
            style={{ padding: "10px 20px", fontSize: 16 }}
          >
            {t("home.orderHere")}
          </button>
        </div>
      )}

      {data.map((b: any) => (
        <div
          key={b.id}
          style={{ padding: 12, border: "1px solid #ccc", marginBottom: 12, opacity: b.comingSoon ? 0.6 : 1 }}
        >
          <h3>{b.name}</h3>
          {b.address && <p>{b.address}{b.city ? `, ${b.city}` : ""}</p>}
          {b.comingSoon ? (
            <p>{t("home.comingSoonLabel")}</p>
          ) : (
            <p>{b.isOpen ? t("home.openNow") : t("home.closed")}</p>
          )}
          <button
            disabled={b.comingSoon}
            onClick={() => navigate(branchPath(b.id))}
          >
            {b.comingSoon ? t("home.comingSoonLabel") : t("home.featuredCta")}
          </button>
        </div>
      ))}
    </div>
  )
}
