import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getPlatformSettings,
  getSuperAdminBranchSettings,
  updatePlatformSettings,
  updateSuperAdminBranchSettings,
  type BranchSettingsDetail,
  type PlatformSettings
} from "@/api/superAdmin"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { PERMISSION_DEPENDENCIES } from "@/hooks/useAdminPermissions"
import BranchHoursEditor from "../components/BranchHoursEditor"
import BranchDeliveryEditor from "../components/BranchDeliveryEditor"
import BranchPaymentAdminSection from "../components/BranchPaymentAdminSection"
import { invalidateCustomerWebsiteCaches } from "@/lib/invalidateCustomerCaches"

const TABS = [
  { id: "website", label: "Website & checkout" },
  { id: "marketing", label: "Marketing automation" },
  { id: "notifications", label: "Notifications" },
  { id: "loyalty", label: "Loyalty program" },
  { id: "permissions", label: "Manager permissions" },
  { id: "branch", label: "Branch settings" },
  { id: "pages", label: "Admin pages" }
] as const

type TabId = (typeof TABS)[number]["id"]

const PERMISSION_SECTIONS: Array<{ title: string; keys: string[] }> = [
  { title: "Dashboard & orders", keys: ["dashboard", "orders"] },
  {
    title: "Menu",
    keys: ["menu_view", "menu_edit_prices", "menu_edit_availability", "menu_edit_structure"]
  },
  { title: "Opening hours", keys: ["hours_view", "hours_edit"] },
  { title: "Delivery", keys: ["delivery_view", "delivery_edit"] },
  {
    title: "Customers & CRM",
    keys: ["customers_view", "customers_export", "customers_automation", "reviews_view"]
  },
  { title: "Offers & promotions", keys: ["offers_view", "offers_edit"] }
]

const PERMISSION_LABELS: Record<string, string> = {
  dashboard: "View dashboard",
  orders: "View orders",
  menu_view: "View menu",
  menu_edit_prices: "Edit menu prices",
  menu_edit_availability: "Toggle item availability",
  menu_edit_structure: "Edit menu structure, variants & extras",
  hours_view: "View opening hours",
  hours_edit: "Edit opening hours",
  delivery_view: "View delivery settings",
  delivery_edit: "Edit delivery settings",
  customers_view: "View customers",
  customers_export: "Export customer CSV",
  customers_automation: "Run win-back & birthday automation",
  reviews_view: "View customer feedback",
  offers_view: "View branch offers",
  offers_edit: "Edit branch offers"
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc"
}

const sectionStyle: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  border: "1px solid #e8e8e8",
  borderRadius: 10,
  background: "#fff"
}

const subsectionStyle: React.CSSProperties = {
  marginTop: 28,
  paddingTop: 24,
  borderTop: "1px solid #eee"
}

function dependentKeys(parentKey: string) {
  return Object.entries(PERMISSION_DEPENDENCIES)
    .filter(([, parent]) => parent === parentKey)
    .map(([child]) => child)
}

function Label({
  children,
  hint
}: {
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ marginBottom: 6, fontWeight: 500 }}>{children}</div>
      {hint && <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>{hint}</div>}
    </label>
  )
}

export default function PlatformSettingsPage() {
  const [tab, setTab] = useState<TabId>("website")
  const { branchId } = useAdminBranch()
  const queryClient = useQueryClient()

  const { data: global, isLoading: globalLoading } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: getPlatformSettings
  })

  const {
    data: branchSettings,
    isLoading: branchLoading,
    isError: branchError,
    error: branchQueryError,
    refetch: refetchBranchSettings
  } = useQuery({
    queryKey: ["superAdminBranchSettings", branchId],
    queryFn: () => getSuperAdminBranchSettings(branchId!),
    enabled: !!branchId
  })

  const [platform, setPlatform] = useState<PlatformSettings["platform"] | null>(null)
  const [notifications, setNotifications] = useState<PlatformSettings["notifications"] | null>(null)
  const [loyalty, setLoyalty] = useState<PlatformSettings["loyalty"] | null>(null)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [branch, setBranch] = useState<BranchSettingsDetail | null>(null)

  useEffect(() => {
    if (!global) return
    setPlatform(global.platform)
    setNotifications(global.notifications)
    setLoyalty(global.loyalty)
    setPermissions(global.permissions ?? {})
  }, [global])

  useEffect(() => {
    setBranch(null)
  }, [branchId])

  useEffect(() => {
    if (branchSettings) setBranch(branchSettings)
  }, [branchSettings])

  function branchSettingsErrorMessage() {
    if (branchQueryError && typeof branchQueryError === "object" && "response" in branchQueryError) {
      const data = (
        branchQueryError as {
          response?: { data?: { error?: { message?: string }; message?: string } }
        }
      ).response?.data
      return data?.error?.message ?? data?.message ?? null
    }
    if (branchQueryError instanceof Error && branchQueryError.message) {
      return branchQueryError.message
    }
    return null
  }

  const saveGlobalMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updatePlatformSettings>[0]) =>
      updatePlatformSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformSettings"] })
      queryClient.invalidateQueries({ queryKey: ["superAdminPermissions"] })
      queryClient.invalidateQueries({ queryKey: ["managerSession"] })
      invalidateCustomerWebsiteCaches(queryClient)
    }
  })

  const saveBranchMutation = useMutation({
    mutationFn: () => updateSuperAdminBranchSettings(branchId!, branch ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminBranchSettings", branchId] })
      queryClient.invalidateQueries({ queryKey: ["managerBranch", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
    }
  })

  const togglePermission = (key: string, enabled: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: enabled }
      if (!enabled) {
        for (const child of dependentKeys(key)) next[child] = false
      }
      return next
    })
  }

  if (globalLoading) return <p>Loading platform settings…</p>

  if (!global) {
    return (
      <div style={{ maxWidth: 720 }}>
        <h2>Platform settings</h2>
        <p style={{ color: "crimson" }}>
          Could not load platform settings. Your session may have expired — try signing out and
          back in.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Platform settings</h2>
      <p style={{ color: "#666", maxWidth: 720 }}>
        Super admin control center — edit all website-wide and per-branch settings from one
        place. Branch-specific delivery zones, opening hours, menu, staff, and customers are
        managed on their dedicated admin pages (linked below).
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 20,
          marginBottom: 8
        }}
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: tab === item.id ? "2px solid #6b4eff" : "1px solid #ddd",
              background: tab === item.id ? "#f0ebff" : "#fff",
              cursor: "pointer",
              fontWeight: tab === item.id ? 600 : 400
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "website" && platform && (
        <div style={sectionStyle}>
          <h3>Website & checkout</h3>
          <p style={{ color: "#666" }}>
            Global checkout behaviour — applies to all branches unless a branch disables its
            own website discount.
          </p>
          <Label hint="Percentage off subtotal for online orders">
            Website order discount (%)
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={platform.websiteOrderDiscountPct}
              onChange={(e) =>
                setPlatform({ ...platform, websiteOrderDiscountPct: Number(e.target.value) })
              }
              style={fieldStyle}
            />
          </Label>
          <label style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={platform.freeDrinkCheckoutEnabled}
              onChange={(e) =>
                setPlatform({ ...platform, freeDrinkCheckoutEnabled: e.target.checked })
              }
            />
            Enable free-drink promotion at checkout (backend)
          </label>
          <label style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={platform.showFreeDrinkCheckout}
              onChange={(e) =>
                setPlatform({ ...platform, showFreeDrinkCheckout: e.target.checked })
              }
            />
            Show free-drink selector on checkout page (customer UI)
          </label>
          <label style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={platform.showLoyaltyCheckout}
              onChange={(e) =>
                setPlatform({ ...platform, showLoyaltyCheckout: e.target.checked })
              }
            />
            Show loyalty points on checkout page (customer UI)
          </label>
          <button
            style={{ marginTop: 8, padding: "10px 18px" }}
            disabled={saveGlobalMutation.isPending}
            onClick={() => saveGlobalMutation.mutate({ platform })}
          >
            {saveGlobalMutation.isPending ? "Saving…" : "Save website settings"}
          </button>
        </div>
      )}

      {tab === "marketing" && platform && (
        <div style={sectionStyle}>
          <h3>Marketing automation</h3>
          <p style={{ color: "#666" }}>
            Promo codes used in win-back and birthday messages (manager automation button and
            scheduled job).
          </p>
          <Label>
            Win-back promo code
            <input
              value={platform.winbackPromoCode}
              onChange={(e) => setPlatform({ ...platform, winbackPromoCode: e.target.value })}
              style={fieldStyle}
            />
          </Label>
          <Label>
            Birthday promo code
            <input
              value={platform.birthdayPromoCode}
              onChange={(e) => setPlatform({ ...platform, birthdayPromoCode: e.target.value })}
              style={fieldStyle}
            />
          </Label>
          <button
            style={{ marginTop: 8, padding: "10px 18px" }}
            disabled={saveGlobalMutation.isPending}
            onClick={() => saveGlobalMutation.mutate({ platform })}
          >
            {saveGlobalMutation.isPending ? "Saving…" : "Save marketing codes"}
          </button>
        </div>
      )}

      {tab === "notifications" && notifications && (
        <div style={sectionStyle}>
          <h3>Notifications</h3>
          <p style={{ color: "#666" }}>Channel toggles and order lifecycle notification flags.</p>
          {(
            [
              ["enableSms", "SMS notifications"],
              ["enablePush", "Push notifications"],
              ["enableEmail", "Email notifications"],
              ["notifyOrderPlaced", "Notify on order placed"],
              ["notifyOrderAccepted", "Notify on order accepted"],
              ["notifyOutForDelivery", "Notify when out for delivery"],
              ["notifyDelivered", "Notify when delivered"]
            ] as const
          ).map(([key, label]) => (
            <label key={key} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={Boolean(notifications[key])}
                onChange={(e) =>
                  setNotifications({ ...notifications, [key]: e.target.checked })
                }
              />
              {label}
            </label>
          ))}
          <Label>
            SMS provider
            <input
              value={notifications.smsProvider}
              onChange={(e) =>
                setNotifications({ ...notifications, smsProvider: e.target.value })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Push provider
            <input
              value={notifications.pushProvider}
              onChange={(e) =>
                setNotifications({ ...notifications, pushProvider: e.target.value })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Email provider
            <input
              value={notifications.emailProvider}
              onChange={(e) =>
                setNotifications({ ...notifications, emailProvider: e.target.value })
              }
              style={fieldStyle}
            />
          </Label>
          <button
            style={{ marginTop: 8, padding: "10px 18px" }}
            disabled={saveGlobalMutation.isPending}
            onClick={() => saveGlobalMutation.mutate({ notifications })}
          >
            {saveGlobalMutation.isPending ? "Saving…" : "Save notifications"}
          </button>
        </div>
      )}

      {tab === "loyalty" && loyalty && (
        <div style={sectionStyle}>
          <h3>Loyalty program</h3>
          <Label>
            Points per € spent
            <input
              type="number"
              min={0}
              step={0.1}
              value={loyalty.pointsPerCurrency}
              onChange={(e) =>
                setLoyalty({ ...loyalty, pointsPerCurrency: Number(e.target.value) })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Silver tier threshold
            <input
              type="number"
              value={loyalty.silverThreshold}
              onChange={(e) =>
                setLoyalty({ ...loyalty, silverThreshold: Number(e.target.value) })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Gold tier threshold
            <input
              type="number"
              value={loyalty.goldThreshold}
              onChange={(e) =>
                setLoyalty({ ...loyalty, goldThreshold: Number(e.target.value) })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Platinum tier threshold
            <input
              type="number"
              value={loyalty.platinumThreshold}
              onChange={(e) =>
                setLoyalty({ ...loyalty, platinumThreshold: Number(e.target.value) })
              }
              style={fieldStyle}
            />
          </Label>
          <Label>
            Points expire after (months, empty = never)
            <input
              type="number"
              min={0}
              value={loyalty.pointsExpireMonths ?? ""}
              onChange={(e) =>
                setLoyalty({
                  ...loyalty,
                  pointsExpireMonths: e.target.value ? Number(e.target.value) : null
                })
              }
              style={fieldStyle}
            />
          </Label>
          <label style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={loyalty.allowPromoStacking}
              onChange={(e) =>
                setLoyalty({ ...loyalty, allowPromoStacking: e.target.checked })
              }
            />
            Allow promo codes to stack with other discounts
          </label>
          <button
            style={{ marginTop: 8, padding: "10px 18px" }}
            disabled={saveGlobalMutation.isPending}
            onClick={() => saveGlobalMutation.mutate({ loyalty })}
          >
            {saveGlobalMutation.isPending ? "Saving…" : "Save loyalty settings"}
          </button>
        </div>
      )}

      {tab === "permissions" && (
        <div style={sectionStyle}>
          <h3>Manager permissions</h3>
          <p style={{ color: "#666" }}>
            Control what branch managers can access. Super admin always has full access.
          </p>
          {PERMISSION_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 10 }}>{section.title}</h4>
              <div style={{ display: "grid", gap: 8 }}>
                {section.keys.map((key) => {
                  const parent = PERMISSION_DEPENDENCIES[key]
                  const parentOff = parent ? !permissions[parent] : false
                  return (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        opacity: parentOff ? 0.6 : 1
                      }}
                    >
                      <span>{PERMISSION_LABELS[key] ?? key}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(permissions[key])}
                        disabled={parentOff}
                        onChange={(e) => togglePermission(key, e.target.checked)}
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
          <button
            style={{ marginTop: 20, padding: "10px 18px" }}
            disabled={saveGlobalMutation.isPending}
            onClick={() => saveGlobalMutation.mutate({ permissions })}
          >
            {saveGlobalMutation.isPending ? "Saving…" : "Save permissions"}
          </button>
        </div>
      )}

      {tab === "branch" && (
        <div style={sectionStyle}>
          <h3>Branch settings</h3>
          <p style={{ color: "#666" }}>
            Use the branch switcher above. Profile, opening hours, and delivery zones are all
            editable below.
          </p>
          {!branchId ? (
            <p>Select a branch using the switcher above.</p>
          ) : branchLoading ? (
            <p>Loading branch settings…</p>
          ) : branchError ? (
            <div>
              <p style={{ color: "#b00020" }}>
                Could not load branch settings
                {branchSettingsErrorMessage() ? `: ${branchSettingsErrorMessage()}` : "."}
              </p>
              <button
                type="button"
                style={{ marginTop: 8, padding: "8px 14px" }}
                onClick={() => refetchBranchSettings()}
              >
                Retry
              </button>
            </div>
          ) : !branch ? (
            <p>No branch settings were returned for this branch.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Label>
                  Branch name
                  <input
                    value={branch.name}
                    onChange={(e) => setBranch({ ...branch, name: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Terminal code
                  <input
                    value={branch.terminalCode}
                    onChange={(e) => setBranch({ ...branch, terminalCode: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Status
                  <select
                    value={branch.status === "coming_soon" ? "coming_soon" : "live"}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        status: e.target.value as "live" | "coming_soon"
                      })
                    }
                    style={fieldStyle}
                  >
                    <option value="live">Live (accepting orders)</option>
                    <option value="coming_soon">Coming soon (menu visible, no orders)</option>
                  </select>
                </Label>
                <Label>
                  Slug (URL)
                  <input
                    value={branch.slug}
                    onChange={(e) => setBranch({ ...branch, slug: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  City
                  <input
                    value={branch.city}
                    onChange={(e) => setBranch({ ...branch, city: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Postal code
                  <input
                    value={branch.postalCode}
                    onChange={(e) => setBranch({ ...branch, postalCode: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
              </div>
              <Label>
                Address
                <input
                  value={branch.address}
                  onChange={(e) => setBranch({ ...branch, address: e.target.value })}
                  style={fieldStyle}
                />
              </Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Label>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={branch.lat ?? ""}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        lat: e.target.value ? Number(e.target.value) : null
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={branch.lng ?? ""}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        lng: e.target.value ? Number(e.target.value) : null
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
              </div>
              <label style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={branch.supportsPickup}
                  onChange={(e) =>
                    setBranch({ ...branch, supportsPickup: e.target.checked })
                  }
                />
                Supports pickup
              </label>
              <label style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={branch.supportsDelivery}
                  onChange={(e) =>
                    setBranch({ ...branch, supportsDelivery: e.target.checked })
                  }
                />
                Supports delivery
              </label>
              <label style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  checked={branch.ordersPaused}
                  onChange={(e) => setBranch({ ...branch, ordersPaused: e.target.checked })}
                />
                Orders paused (terminal can also toggle during service)
              </label>

              <h4 style={{ marginTop: 24 }}>External links</h4>
              <Label>
                Website URL
                <input
                  value={branch.websiteUrl}
                  onChange={(e) => setBranch({ ...branch, websiteUrl: e.target.value })}
                  style={fieldStyle}
                />
              </Label>
              <Label>
                Lieferando URL
                <input
                  value={branch.lieferandoUrl}
                  onChange={(e) => setBranch({ ...branch, lieferandoUrl: e.target.value })}
                  style={fieldStyle}
                />
              </Label>
              <Label>
                Google Place ID
                <input
                  value={branch.googlePlaceId}
                  onChange={(e) => setBranch({ ...branch, googlePlaceId: e.target.value })}
                  style={fieldStyle}
                />
              </Label>

              <h4 style={{ marginTop: 24 }}>Branch promotions</h4>
              <Label>
                Free drink minimum order (€)
                <input
                  type="number"
                  min={0}
                  value={branch.promotions.freeDrinkMinOrder}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      promotions: {
                        ...branch.promotions,
                        freeDrinkMinOrder: Number(e.target.value)
                      }
                    })
                  }
                  style={fieldStyle}
                />
              </Label>
              <Label>
                Free drink message
                <textarea
                  rows={2}
                  value={branch.promotions.freeDrinkMessage}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      promotions: {
                        ...branch.promotions,
                        freeDrinkMessage: e.target.value
                      }
                    })
                  }
                  style={fieldStyle}
                />
              </Label>
              <label style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={branch.promotions.websiteDiscountEnabled}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      promotions: {
                        ...branch.promotions,
                        websiteDiscountEnabled: e.target.checked
                      }
                    })
                  }
                />
                Website discount enabled for this branch
              </label>
              <label style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  checked={branch.promotions.freeDrinkEnabled}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      promotions: {
                        ...branch.promotions,
                        freeDrinkEnabled: e.target.checked
                      }
                    })
                  }
                />
                Free drink promotion enabled for this branch
              </label>

              {branchId ? <BranchPaymentAdminSection branchId={branchId} /> : null}

              <h4 style={{ marginTop: 24 }}>Kitchen & printing</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Label>
                  Printer type
                  <input
                    value={branch.printerType}
                    onChange={(e) => setBranch({ ...branch, printerType: e.target.value })}
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Avg prep time baseline (min)
                  <input
                    type="number"
                    value={branch.avgPrepTimeBaseline}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        avgPrepTimeBaseline: Number(e.target.value)
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Printer URL
                  <input
                    value={branch.printerUrl ?? ""}
                    onChange={(e) =>
                      setBranch({ ...branch, printerUrl: e.target.value || null })
                    }
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Printing mode
                  <input
                    value={branch.printing.printingMode}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        printing: { ...branch.printing, printingMode: e.target.value }
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Print copies
                  <input
                    type="number"
                    min={1}
                    value={branch.printing.printCopies}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        printing: {
                          ...branch.printing,
                          printCopies: Number(e.target.value)
                        }
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
                <Label>
                  Routing mode
                  <input
                    value={branch.printing.routingMode}
                    onChange={(e) =>
                      setBranch({
                        ...branch,
                        printing: { ...branch.printing, routingMode: e.target.value }
                      })
                    }
                    style={fieldStyle}
                  />
                </Label>
              </div>
              <label style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  checked={branch.printing.autoPrint}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      printing: { ...branch.printing, autoPrint: e.target.checked }
                    })
                  }
                />
                Auto-print new orders
              </label>

              <button
                style={{ padding: "10px 18px" }}
                disabled={saveBranchMutation.isPending || !branchId}
                onClick={() => saveBranchMutation.mutate()}
              >
                {saveBranchMutation.isPending ? "Saving…" : "Save branch settings"}
              </button>

              <div style={subsectionStyle}>
                <h4 style={{ marginTop: 0 }}>Opening hours</h4>
                <BranchHoursEditor branchId={branchId} canEdit embedded />
              </div>

              <div style={subsectionStyle}>
                <h4 style={{ marginTop: 0 }}>Delivery zones & fees</h4>
                <BranchDeliveryEditor branchId={branchId} canEdit embedded />
              </div>
            </>
          )}
        </div>
      )}

      {tab === "pages" && (
        <div style={sectionStyle}>
          <h3>Admin pages</h3>
          <p style={{ color: "#666" }}>
            Full editors for complex settings — switch branch above, then open:
          </p>
          <ul style={{ lineHeight: 2 }}>
            <li>
              <Link to="/admin/menu">Menu</Link> — prices, availability, categories, items,
              variants, extras
            </li>
            <li>
              <Link to="/admin/offers">Offers</Link> — branch promotion messaging
            </li>
            <li>
              <Link to="/admin/customers">Customers</Link> — CRM, export, automation
            </li>
            <li>
              <Link to="/admin/staff">Staff</Link> — manager & admin accounts
            </li>
            <li>
              <Link to="/admin/orders">Orders</Link> — order history
            </li>
            <li>
              <Link to="/admin/reviews">Customer feedback</Link> — order reviews
            </li>
            <li>
              <Link to="/admin/dashboard">Dashboard</Link> — branch KPIs
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
