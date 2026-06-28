import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createManagerCouponCampaign,
  getManagerCouponCampaigns,
  updateManagerCouponCampaign
} from "@/api/coupons"
import { getManagerPromotions, updateManagerPromotions } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import { invalidateCustomerWebsiteCaches } from "@/lib/invalidateCustomerCaches"

export default function BranchOffersPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const queryClient = useQueryClient()
  const canEdit = can("offers_edit")
  const readOnly = can("offers_view") && !canEdit

  const { data, isLoading } = useQuery({
    queryKey: ["managerPromotions", branchId],
    queryFn: () => getManagerPromotions(branchId),
    enabled: !!branchId
  })

  const { data: couponData, isLoading: couponsLoading } = useQuery({
    queryKey: ["managerCouponCampaigns", branchId],
    queryFn: () => getManagerCouponCampaigns(branchId),
    enabled: !!branchId
  })

  const [freeDrinkMinOrder, setFreeDrinkMinOrder] = useState(35)
  const [freeDrinkMessage, setFreeDrinkMessage] = useState("")
  const [websiteDiscountEnabled, setWebsiteDiscountEnabled] = useState(true)

  const [couponTitle, setCouponTitle] = useState("")
  const [couponDescription, setCouponDescription] = useState("")
  const [couponDiscountType, setCouponDiscountType] = useState("percent")
  const [couponDiscountValue, setCouponDiscountValue] = useState(10)
  const [couponMinOrder, setCouponMinOrder] = useState(15)
  const [couponNewCustomersOnly, setCouponNewCustomersOnly] = useState(true)

  React.useEffect(() => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerPromotions", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
    }
  })

  const createCouponMutation = useMutation({
    mutationFn: () =>
      createManagerCouponCampaign(
        {
          title: couponTitle,
          description: couponDescription || undefined,
          discountType: couponDiscountType,
          discountValue: couponDiscountValue,
          minOrder: couponMinOrder,
          scope: "branch",
          newCustomersOnly: couponNewCustomersOnly
        },
        branchId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerCouponCampaigns", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
      setCouponTitle("")
      setCouponDescription("")
    }
  })

  const toggleCouponMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateManagerCouponCampaign(id, { isActive }, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerCouponCampaigns", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
    }
  })

  if (isLoading || couponsLoading) return <p>Loading offers…</p>

  const campaigns = couponData?.campaigns ?? []

  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Branch offers</h2>
      <p style={{ color: "#666" }}>
        Promotions for this branch — free drink, website discount, and clickable coupons for
        registered customers.
      </p>
      {readOnly && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled until the super admin enables offers edit permission.
        </p>
      )}

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
          {saveMutation.isPending ? "Saving…" : "Save checkout promos"}
        </button>
      )}

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #ddd" }} />

      <h3>Clickable coupons</h3>
      <p style={{ color: "#666" }}>
        Customers tap these on the menu or offers page. Registration is required — coupons land in
        their wallet and apply at checkout.
      </p>

      {campaigns.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10, marginTop: 16 }}>
          {campaigns
            .filter((c) => c.branchId === branchId)
            .map((campaign) => (
              <li
                key={campaign.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              >
                <div>
                  <strong>{campaign.title}</strong>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {campaign.discountType} {campaign.discountValue}
                    {campaign.newCustomersOnly ? " · new customers" : ""}
                  </div>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleCouponMutation.mutate({
                        id: campaign.id,
                        isActive: campaign.isActive === false
                      })
                    }
                  >
                    {campaign.isActive === false ? "Enable" : "Disable"}
                  </button>
                )}
              </li>
            ))}
        </ul>
      )}

      {canEdit && (
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <h4 style={{ margin: 0 }}>New branch coupon</h4>
          <input
            placeholder="Title"
            value={couponTitle}
            onChange={(e) => setCouponTitle(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={couponDescription}
            onChange={(e) => setCouponDescription(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <select
              value={couponDiscountType}
              onChange={(e) => setCouponDiscountType(e.target.value)}
              style={{ padding: 8, borderRadius: 6 }}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed €</option>
              <option value="free_delivery">Free delivery</option>
            </select>
            <input
              type="number"
              min={0}
              value={couponDiscountValue}
              onChange={(e) => setCouponDiscountValue(Number(e.target.value))}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <input
              type="number"
              min={0}
              value={couponMinOrder}
              onChange={(e) => setCouponMinOrder(Number(e.target.value))}
              placeholder="Min order"
              style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={couponNewCustomersOnly}
              onChange={(e) => setCouponNewCustomersOnly(e.target.checked)}
            />
            <span>New customers only</span>
          </label>
          <button
            type="button"
            onClick={() => createCouponMutation.mutate()}
            disabled={createCouponMutation.isPending || !couponTitle.trim()}
          >
            {createCouponMutation.isPending ? "Creating…" : "Create coupon"}
          </button>
        </div>
      )}
    </div>
  )
}
