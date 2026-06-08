import React from "react"
import { Navigate } from "react-router-dom"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"

type Props = {
  children: React.ReactNode
  /** Single permission required */
  permission?: string
  /** Any one of these permissions grants access */
  anyOf?: string[]
  /** Only super admin (owner) */
  superAdminOnly?: boolean
}

function PermissionDenied({ message }: { message?: string }) {
  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2>Access restricted</h2>
      <p style={{ color: "#666" }}>
        {message ??
          "Your branch manager account does not have permission for this section. Contact the super admin to enable it."}
      </p>
    </div>
  )
}

export default function AdminPermissionRoute({
  children,
  permission,
  anyOf,
  superAdminOnly
}: Props) {
  const { can, isSuperAdmin, isLoading } = useAdminPermissions()

  if (isLoading) {
    return (
      <div style={{ maxWidth: 480 }}>
        <p>Loading permissions…</p>
        <p style={{ color: "#666", fontSize: 14 }}>
          If this takes more than a minute, the server may be waking up (Render free tier). Refresh
          once, or upgrade to Render Starter for instant loads — see DEPLOYMENT_ROADMAP.md.
        </p>
      </div>
    )
  }

  if (superAdminOnly) {
    if (!isSuperAdmin) return <PermissionDenied message="This page is only available to the super admin." />
    return <>{children}</>
  }

  if (isSuperAdmin) return <>{children}</>

  if (permission && !can(permission)) {
    return <PermissionDenied />
  }

  if (anyOf && !anyOf.some((p) => can(p))) {
    return <PermissionDenied />
  }

  return <>{children}</>
}

/** Redirect /admin to the first page the manager is allowed to see */
export function AdminHomeRedirect() {
  const { can, isSuperAdmin, isLoading } = useAdminPermissions()

  if (isLoading) {
    return (
      <div style={{ maxWidth: 480 }}>
        <p>Loading…</p>
        <p style={{ color: "#666", fontSize: 14 }}>
          Waking up the server can take up to a minute on the free hosting plan.
        </p>
      </div>
    )
  }

  if (isSuperAdmin) return <Navigate to="/admin/dashboard" replace />

  const order = [
    { path: "/admin/dashboard", perm: "dashboard" },
    { path: "/admin/orders", perm: "orders" },
    { path: "/admin/menu", perm: "menu_view" },
    { path: "/admin/hours", perm: "hours_view" },
    { path: "/admin/delivery", perm: "delivery_view" },
    { path: "/admin/offers", perm: "offers_view" },
    { path: "/admin/customers", perm: "customers_view" },
    { path: "/admin/reviews", perm: "reviews_view" }
  ]

  const first = order.find((o) => can(o.perm))
  if (first) return <Navigate to={first.path} replace />

  return <PermissionDenied message="No admin permissions are enabled for your account." />
}
