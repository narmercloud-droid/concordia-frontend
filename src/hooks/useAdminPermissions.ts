import { useQuery } from "@tanstack/react-query"
import { getManagerSession } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export type ManagerPermissions = Record<string, boolean>

export function useAdminPermissions() {
  const admin = useAdminAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "admin"

  const { data, isLoading } = useQuery({
    queryKey: ["managerSession"],
    queryFn: getManagerSession,
    staleTime: 5 * 60_000
  })

  const permissions = (data?.permissions ?? {}) as ManagerPermissions

  const can = (key: string) => {
    if (isSuperAdmin) return true
    return Boolean(permissions[key])
  }

  return { can, permissions, isLoading, isSuperAdmin }
}
