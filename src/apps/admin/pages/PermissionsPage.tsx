import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSuperAdminPermissions,
  updateSuperAdminPermissions
} from "@/api/superAdmin"

const LABELS: Record<string, string> = {
  dashboard: "View dashboard",
  orders: "View orders",
  menu_view: "View menu",
  menu_edit_prices: "Edit menu prices",
  menu_edit_availability: "Toggle item availability",
  hours_view: "View opening hours",
  hours_edit: "Edit opening hours",
  delivery_view: "View delivery settings",
  delivery_edit: "Edit delivery settings",
  customers_view: "View customers",
  customers_export: "Export customer CSV",
  customers_automation: "Run win-back & birthday automation",
  offers_view: "View branch offers",
  offers_edit: "Edit branch offers"
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

  if (isLoading) return <p>Loading permissions…</p>

  const keys = data?.keys ?? Object.keys(LABELS)

  return (
    <div>
      <h2>Manager permissions</h2>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Control what branch managers can access. Super admin (owner) always has full
        access to every branch.
      </p>

      <div style={{ marginTop: 20, display: "grid", gap: 10, maxWidth: 520 }}>
        {keys.map((key) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              background: "#fff"
            }}
          >
            <span>{LABELS[key] ?? key}</span>
            <input
              type="checkbox"
              checked={Boolean(permissions[key])}
              onChange={(e) =>
                setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
              }
            />
          </label>
        ))}
      </div>

      <button
        style={{ marginTop: 20, padding: "10px 18px" }}
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? "Saving…" : "Save permissions"}
      </button>
    </div>
  )
}
