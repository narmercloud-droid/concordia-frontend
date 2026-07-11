import { useQuery } from "@tanstack/react-query"
import { getManagerSession } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export type ManagerPermissions = Record<string, boolean>

/** Edit permissions require their matching view permission */
export const PERMISSION_DEPENDENCIES: Record<string, string> = {
  menu_edit_prices: "menu_view",
  menu_edit_availability: "menu_view",
  menu_edit_structure: "menu_view",
  hours_edit: "hours_view",
  delivery_edit: "delivery_view",
  customers_export: "customers_view",
  customers_automation: "customers_view",
  offers_edit: "offers_view"
}

export function permissionAllowed(
  permissions: ManagerPermissions,
  key: string,
  isSuperAdmin: boolean
) {
  if (isSuperAdmin) return true
  if (!permissions[key]) return false
  const dep = PERMISSION_DEPENDENCIES[key]
  if (dep && !permissions[dep]) return false
  return true
}

export function useAdminPermissions() {
  const admin = useAdminAuthStore((s) => s.admin)
  const token = useAdminAuthStore((s) => s.token)

  const { data, isLoading: sessionLoading, isError: sessionError } = useQuery({
    queryKey: ["managerSession"],
    queryFn: getManagerSession,
    staleTime: 5 * 60_000,
    enabled: Boolean(token),
    retry: false
  })

  const permissions = (data?.permissions ?? {}) as ManagerPermissions
  const isSuperAdmin = data?.isSuperAdmin === true || admin?.role === "admin"

  const can = (key: string) => permissionAllowed(permissions, key, isSuperAdmin)

  const canAny = (keys: string[]) => keys.some((k) => can(k))

  const isLoading = Boolean(token) && sessionLoading

  return { can, canAny, permissions, isLoading, sessionLoading, sessionError, isSuperAdmin }
}
