import React, { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getManagerSession } from "@/api/manager"
import LoadingFallback from "@/apps/customer/components/LoadingFallback"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAdminAuthStore((s) => s.token)
  const logout = useAdminAuthStore((s) => s.logout)

  const { isLoading, isError } = useQuery({
    queryKey: ["managerSession"],
    queryFn: getManagerSession,
    staleTime: 5 * 60_000,
    enabled: Boolean(token),
    retry: false
  })

  useEffect(() => {
    if (isError) logout()
  }, [isError, logout])

  if (!token || isError) {
    return <Navigate to="/admin/login" replace />
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  return <>{children}</>
}
