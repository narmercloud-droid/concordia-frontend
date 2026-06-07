import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getManagerDeliverySettings,
  updateManagerDeliverySettings
} from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import Button from "@/components/ui/Button"

type DeliveryArea = {
  postalCode: string
  minimumOrder: number
  deliveryFee: number
  name?: string
}

type DeliveryMode = "postcodes" | "radius" | "both"

type RadiusZone = {
  maxDistanceKm: number
  minimumOrder: number
  deliveryFee: number
  label?: string
}

export default function DeliveryAreasPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const canEdit = can("delivery_edit")
  const readOnly = can("delivery_view") && !canEdit
  const queryClient = useQueryClient()

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("postcodes")
  const [freeDeliveryAtMinimum, setFreeDeliveryAtMinimum] = useState(true)
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [radiusZones, setRadiusZones] = useState<RadiusZone[]>([
    { maxDistanceKm: 5, minimumOrder: 15, deliveryFee: 2, label: "0–5 km" },
    { maxDistanceKm: 10, minimumOrder: 20, deliveryFee: 3, label: "5–10 km" },
    { maxDistanceKm: 15, minimumOrder: 30, deliveryFee: 4, label: "10–15 km" }
  ])
  const [saved, setSaved] = useState(false)

  const { data: config, isLoading } = useQuery({
    queryKey: ["managerDeliverySettings", branchId],
    queryFn: () => getManagerDeliverySettings(branchId)
  })

  useEffect(() => {
    if (!config) return

    setDeliveryMode((config.deliveryMode as DeliveryMode) ?? "postcodes")
    setFreeDeliveryAtMinimum(config.freeDeliveryAtMinimum !== false)
    setAreas((config.deliveryAreas as DeliveryArea[]) ?? [])

    const zones = (config.deliveryRadiusZones as RadiusZone[]) ?? []
    if (zones.length > 0) {
      setRadiusZones(zones)
    } else {
      const legacy = (config.deliveryRadius ?? {}) as Record<string, number>
      if (legacy.maxDistanceKm) {
        setRadiusZones([
          {
            maxDistanceKm: Number(legacy.maxDistanceKm),
            minimumOrder: Number(legacy.minimumOrder ?? 15),
            deliveryFee: Number(legacy.deliveryFee ?? 2)
          }
        ])
      }
    }
  }, [config])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateManagerDeliverySettings(
        {
          deliveryMode,
          freeDeliveryAtMinimum,
          deliveryAreas: areas,
          deliveryRadiusZones: radiusZones
        },
        branchId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerDeliverySettings", branchId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  const updateArea = (index: number, field: keyof DeliveryArea, value: string | number) => {
    setAreas((prev) =>
      prev.map((area, i) => (i === index ? { ...area, [field]: value } : area))
    )
  }

  const addArea = () => {
    setAreas((prev) => [
      ...prev,
      { postalCode: "", minimumOrder: 15, deliveryFee: 2, name: "" }
    ])
  }

  const removeArea = (index: number) => {
    setAreas((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) return <p>Loading delivery settings...</p>

  return (
    <div>
      <h2>Delivery settings</h2>
      <p style={{ color: "#666" }}>
        Choose how you deliver: by postcode zones, by distance from the restaurant, or both.
      </p>
      {readOnly && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled until the super admin enables delivery edit permission.
        </p>
      )}

      <section style={{ marginTop: 24, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
        <h3>How do you deliver?</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {(
            [
              ["postcodes", "Postcode zones only", "Deliver only to listed postcodes (Lieferando style)"],
              ["radius", "Distance radius only", "Deliver to any address within X km of the restaurant"],
              ["both", "Postcodes + radius", "Listed postcodes OR any address within the radius"]
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input
                type="radio"
                name="deliveryMode"
                checked={deliveryMode === value}
                disabled={!canEdit}
                onChange={() => setDeliveryMode(value)}
              />
              <span>
                <strong>{label}</strong>
                <br />
                <span style={{ color: "#666", fontSize: 14 }}>{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20, padding: 16, background: "#f0f7ff", borderRadius: 8 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={freeDeliveryAtMinimum}
            disabled={!canEdit}
            onChange={(e) => setFreeDeliveryAtMinimum(e.target.checked)}
          />
          <span>
            <strong>Free delivery when minimum order is reached</strong>
            <br />
            <span style={{ color: "#666", fontSize: 14 }}>
              Customer pays €0 delivery fee once their basket meets the minimum order for their zone or radius.
            </span>
          </span>
        </label>
      </section>

      {(deliveryMode === "postcodes" || deliveryMode === "both") && (
        <section style={{ marginTop: 24 }}>
          <h3>Postcode zones</h3>
          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Postcode</th>
                <th style={{ textAlign: "left", padding: 8 }}>Min order (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Delivery fee (€)</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area, index) => (
                <tr key={index}>
                  <td style={{ padding: 8 }}>
                    <input
                      value={area.postalCode}
                      disabled={!canEdit}
                      onChange={(e) => updateArea(index, "postalCode", e.target.value)}
                      placeholder="47906"
                      style={{ width: 80 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      value={area.minimumOrder}
                      disabled={!canEdit}
                      onChange={(e) => updateArea(index, "minimumOrder", Number(e.target.value))}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      step="0.5"
                      value={area.deliveryFee}
                      disabled={!canEdit}
                      onChange={(e) => updateArea(index, "deliveryFee", Number(e.target.value))}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <button disabled={!canEdit} onClick={() => removeArea(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={addArea} disabled={!canEdit} style={{ marginTop: 12 }}>
            Add postcode
          </Button>
        </section>
      )}

      {(deliveryMode === "radius" || deliveryMode === "both") && (
        <section style={{ marginTop: 24 }}>
          <h3>Delivery radius zones</h3>
          <p style={{ color: "#666", fontSize: 14 }}>
            Add multiple distance rings. Each row applies to customers up to that distance (km) from
            the restaurant. Example: 5 km row covers 0–5 km, 10 km row covers 5.1–10 km, and so on.
          </p>
          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Label (optional)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Up to (km)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Min order (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Delivery fee (€)</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {radiusZones.map((zone, index) => (
                <tr key={index}>
                  <td style={{ padding: 8 }}>
                    <input
                      value={zone.label ?? ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setRadiusZones((prev) =>
                          prev.map((z, i) =>
                            i === index ? { ...z, label: e.target.value } : z
                          )
                        )
                      }
                      placeholder="e.g. 5–10 km"
                      style={{ width: 100 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      step="0.5"
                      value={zone.maxDistanceKm}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setRadiusZones((prev) =>
                          prev.map((z, i) =>
                            i === index ? { ...z, maxDistanceKm: Number(e.target.value) } : z
                          )
                        )
                      }
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      value={zone.minimumOrder}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setRadiusZones((prev) =>
                          prev.map((z, i) =>
                            i === index ? { ...z, minimumOrder: Number(e.target.value) } : z
                          )
                        )
                      }
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      step="0.5"
                      value={zone.deliveryFee}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setRadiusZones((prev) =>
                          prev.map((z, i) =>
                            i === index ? { ...z, deliveryFee: Number(e.target.value) } : z
                          )
                        )
                      }
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      disabled={!canEdit}
                      onClick={() =>
                        setRadiusZones((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            disabled={!canEdit}
            onClick={() =>
              setRadiusZones((prev) => [
                ...prev,
                {
                  maxDistanceKm: (prev[prev.length - 1]?.maxDistanceKm ?? 0) + 5,
                  minimumOrder: 15,
                  deliveryFee: 2
                }
              ])
            }
            style={{ marginTop: 12 }}
          >
            Add radius zone
          </Button>
        </section>
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!canEdit || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save delivery settings"}
        </Button>
        {saved && <span style={{ color: "#2e7d32" }}>Saved!</span>}
      </div>
    </div>
  )
}
