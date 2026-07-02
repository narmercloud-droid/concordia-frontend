import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getManagerDeliverySettings,
  updateManagerDeliverySettings
} from "@/api/manager"
import Button from "@/components/ui/Button"
import { invalidateCustomerWebsiteCaches } from "@/lib/invalidateCustomerCaches"

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
  freeDeliveryMinimum?: number
  label?: string
}

type Props = {
  branchId: string | null | undefined
  canEdit?: boolean
  embedded?: boolean
}

export default function BranchDeliveryEditor({
  branchId,
  canEdit = true,
  embedded = false
}: Props) {
  const queryClient = useQueryClient()
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("postcodes")
  const [freeDeliveryAtMinimum, setFreeDeliveryAtMinimum] = useState(true)
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [radiusZones, setRadiusZones] = useState<RadiusZone[]>([
    { maxDistanceKm: 5, minimumOrder: 9.99, deliveryFee: 2, freeDeliveryMinimum: 15, label: "0–5 km" },
    { maxDistanceKm: 7, minimumOrder: 9.99, deliveryFee: 3, freeDeliveryMinimum: 18, label: "5–7 km" },
    { maxDistanceKm: 10, minimumOrder: 9.99, deliveryFee: 3, freeDeliveryMinimum: 20, label: "7–10 km" }
  ])
  const [saved, setSaved] = useState(false)

  const { data: config, isLoading } = useQuery({
    queryKey: ["managerDeliverySettings", branchId],
    queryFn: () => getManagerDeliverySettings(branchId ?? undefined),
    enabled: !!branchId
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
  }, [config, branchId])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateManagerDeliverySettings(
        {
          deliveryMode,
          freeDeliveryAtMinimum,
          deliveryAreas: areas,
          deliveryRadiusZones: radiusZones
        },
        branchId ?? undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerDeliverySettings", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
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

  if (!branchId) {
    return <p style={{ color: "#666" }}>Select a branch to edit delivery settings.</p>
  }

  if (isLoading) return <p>Loading delivery settings…</p>

  return (
    <div style={embedded ? { marginTop: 8 } : undefined}>
      {!embedded && (
        <>
          <h2>Delivery settings</h2>
          <p style={{ color: "#666" }}>
            Choose how you deliver: by postcode zones, by distance from the restaurant, or both.
          </p>
        </>
      )}

      {embedded && (
        <p style={{ color: "#666", fontSize: 14, marginBottom: 12 }}>
          Postcode zones, radius tiers, minimum orders, and delivery fees.
        </p>
      )}

      {!canEdit && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled until the super admin enables delivery edit permission.
        </p>
      )}

      <section style={{ marginTop: 16, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
        <h4 style={{ margin: "0 0 8px" }}>How do you deliver?</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(
            [
              ["postcodes", "Postcode zones only", "Deliver only to listed postcodes"],
              ["radius", "Distance radius only", "Deliver within X km of the restaurant"],
              ["both", "Postcodes + radius", "Listed postcodes OR within the radius"]
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input
                type="radio"
                name={`deliveryMode-${branchId}`}
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

      <section style={{ marginTop: 16, padding: 16, background: "#f0f7ff", borderRadius: 8 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={freeDeliveryAtMinimum}
            disabled={!canEdit}
            onChange={(e) => setFreeDeliveryAtMinimum(e.target.checked)}
          />
          <span>
            <strong>Free delivery when minimum order is reached</strong>
          </span>
        </label>
      </section>

      {(deliveryMode === "postcodes" || deliveryMode === "both") && (
        <section style={{ marginTop: 20 }}>
          <h4>Postcode zones</h4>
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
                    <button type="button" disabled={!canEdit} onClick={() => removeArea(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" onClick={addArea} disabled={!canEdit} style={{ marginTop: 12 }}>
            Add postcode
          </Button>
        </section>
      )}

      {(deliveryMode === "radius" || deliveryMode === "both") && (
        <section style={{ marginTop: 20 }}>
          <h4>Delivery radius zones</h4>
          <p style={{ color: "#666", fontSize: 14 }}>
            Each row applies to customers up to that distance (km) from the restaurant.
          </p>
          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Label</th>
                <th style={{ textAlign: "left", padding: 8 }}>Up to (km)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Min order (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Fee (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Free from (€)</th>
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
                    <input
                      type="number"
                      step="0.5"
                      value={zone.freeDeliveryMinimum ?? ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setRadiusZones((prev) =>
                          prev.map((z, i) =>
                            i === index
                              ? {
                                  ...z,
                                  freeDeliveryMinimum:
                                    e.target.value === "" ? undefined : Number(e.target.value)
                                }
                              : z
                          )
                        )
                      }
                      placeholder="15"
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      type="button"
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
            type="button"
            disabled={!canEdit}
            onClick={() =>
              setRadiusZones((prev) => [
                ...prev,
                {
                  maxDistanceKm: (prev[prev.length - 1]?.maxDistanceKm ?? 0) + 5,
                  minimumOrder: 9.99,
                  deliveryFee: 3,
                  freeDeliveryMinimum: 20
                }
              ])
            }
            style={{ marginTop: 12 }}
          >
            Add radius zone
          </Button>
        </section>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!canEdit || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving…" : "Save delivery settings"}
        </Button>
        {saved && <span style={{ color: "#2e7d32" }}>Saved!</span>}
      </div>
    </div>
  )
}
