import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSuperAdminPermissions,
  updateSuperAdminPermissions
} from "@/api/superAdmin"
import { PERMISSION_DEPENDENCIES } from "@/hooks/useAdminPermissions"

const SECTIONS: Array<{ title: string; keys: string[] }> = [
  {
    title: "Dashboard & orders",
    keys: ["dashboard", "orders"]
  },
  {
    title: "Menu",
    keys: [
      "menu_view",
      "menu_edit_prices",
      "menu_edit_availability",
      "menu_edit_structure"
    ]
  },
  {
    title: "Opening hours",
    keys: ["hours_view", "hours_edit"]
  },
  {
    title: "Delivery",
    keys: ["delivery_view", "delivery_edit"]
  },
  {
    title: "Customers & CRM",
    keys: ["customers_view", "customers_export", "customers_automation", "reviews_view"]
  },
  {
    title: "Offers & promotions",
    keys: ["offers_view", "offers_edit"]
  }
]

const LABELS: Record<string, string> = {
  dashboard: "View dashboard",
  orders: "View orders",
  menu_view: "View menu",
  menu_edit_prices: "Edit menu prices",
  menu_edit_availability: "Toggle item availability",
  menu_edit_structure: "Add/edit categories, items, variants, extras & shared groups",
  hours_view: "View opening hours",
  hours_edit: "Edit opening hours",
  delivery_view: "View delivery settings",
  delivery_edit: "Edit delivery settings",
  customers_view: "View customers",
  customers_export: "Export customer CSV",
  customers_automation: "Run win-back & birthday automation",
  reviews_view: "View website order feedback",
  offers_view: "View branch offers",
  offers_edit: "Edit branch offers"
}

function dependentKeys(parentKey: string) {
  return Object.entries(PERMISSION_DEPENDENCIES)
    .filter(([, parent]) => parent === parentKey)
    .map(([child]) => child)
}

export default function PermissionsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["superAdminPermissions"],
    queryFn: getSuperAdminPermissions
  })

  const [permissions, setPermissions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (data?.permissions) setPermissions(data.permissions)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => updateSuperAdminPermissions(permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminPermissions"] })
      queryClient.invalidateQueries({ queryKey: ["managerSession"] })
    }
  })

  const toggle = (key: string, enabled: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: enabled }
      if (!enabled) {
        for (const child of dependentKeys(key)) {
          next[child] = false
        }
      }
      return next
    })
  }

  if (isLoading) return <p>Loading permissions…</p>

  return (
    <div>
      <h2>Manager permissions</h2>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Control what branch managers can access. Super admin always has full access.
        Edit permissions require their view permission — disabling view automatically
        disables related edits for managers.
      </p>

      {SECTIONS.map((section) => (
        <div key={section.title} style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 10 }}>{section.title}</h3>
          <div style={{ display: "grid", gap: 8, maxWidth: 560 }}>
            {section.keys.map((key) => {
              const parent = PERMISSION_DEPENDENCIES[key]
              const parentOff = parent ? !permissions[parent] : false
              const isChild = Boolean(parent)

              return (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    background: parentOff && isChild ? "#fafafa" : "#fff",
                    opacity: parentOff && isChild ? 0.65 : 1,
                    marginLeft: isChild ? 16 : 0
                  }}
                >
                  <span>
                    {LABELS[key] ?? key}
                    {parentOff && isChild && (
                      <small style={{ display: "block", color: "#999" }}>
                        Requires {LABELS[parent!] ?? parent}
                      </small>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(permissions[key])}
                    disabled={parentOff && isChild}
                    onChange={(e) => toggle(key, e.target.checked)}
                  />
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <button
        style={{ marginTop: 24, padding: "10px 18px" }}
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? "Saving…" : "Save permissions"}
      </button>
    </div>
  )
}
