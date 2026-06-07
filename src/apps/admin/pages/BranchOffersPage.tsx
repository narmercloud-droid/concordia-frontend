import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getManagerPromotions, updateManagerPromotions } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"

export default function BranchOffersPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const queryClient = useQueryClient()
  const canEdit = can("offers_edit")

  const { data, isLoading } = useQuery({
    queryKey: ["managerPromotions", branchId],
    queryFn: () => getManagerPromotions(branchId),
    enabled: !!branchId
  })

  const [freeDrinkMinOrder, setFreeDrinkMinOrder] = useState(35)
  const [freeDrinkMessage, setFreeDrinkMessage] = useState("")
  const [websiteDiscountEnabled, setWebsiteDiscountEnabled] = useState(true)

  useEffect(() => {
    if (!data) return
    setFreeDrinkMinOrder(data.freeDrinkMinOrder)
    setFreeDrinkMessage(data.freeDrinkMessage)
    setWebsiteDiscountEnabled(data.websiteDiscountEnabled)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateManagerPromotions(
        { freeDrinkMinOrder, freeDrinkMessage, websiteDiscountEnabled },
        branchId
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["managerPromotions", branchId] })
  })

  if (isLoading) return <p>Loading offers…</p>

  return (
    <div style={{ maxWidth: 560 }}>
      <h2>Branch offers</h2>
      <p style={{ color: "#666" }}>
        Promotions for this branch only — free drink threshold and messaging shown at
        checkout.
      </p>

      <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
        <label>
          <div style={{ marginBottom: 6 }}>Free drink minimum order (€)</div>
          <input
            type="number"
            min={0}
            step={1}
            value={freeDrinkMinOrder}
            disabled={!canEdit}
            onChange={(e) => setFreeDrinkMinOrder(Number(e.target.value))}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Free drink message (optional)</div>
          <textarea
            rows={2}
            value={freeDrinkMessage}
            disabled={!canEdit}
            onChange={(e) => setFreeDrinkMessage(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="e.g. Choose your complimentary 0.33l soft drink"
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={websiteDiscountEnabled}
            disabled={!canEdit}
            onChange={(e) => setWebsiteDiscountEnabled(e.target.checked)}
          />
          <span>Website discount enabled for this branch</span>
        </label>
      </div>

      {canEdit && (
        <button
          style={{ marginTop: 20, padding: "10px 18px" }}
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving…" : "Save offers"}
        </button>
      )}
    </div>
  )
}
