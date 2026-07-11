import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getManagerSession } from "@/api/manager"
import LoadingFallback from "@/apps/customer/components/LoadingFallback"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAdminAuthStore((s) => s.token)
  const logout = useAdminAuthStore((s) => s.logout)
  const [sessionState, setSessionState] = useState<"checking" | "ok" | "failed">(
    token ? "checking" : "failed"
  )

  useEffect(() => {
    if (!token) {
      setSessionState("failed")
      return
    }

    let cancelled = false
    setSessionState("checking")

    getManagerSession()
      .then(() => {
        if (!cancelled) setSessionState("ok")
      })
      .catch(() => {
        if (!cancelled) {
          logout()
          setSessionState("failed")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, logout])

  if (!token || sessionState === "failed") {
    return <Navigate to="/admin/login" replace />
  }

  if (sessionState === "checking") {
    return <LoadingFallback />
  }

  return <>{children}</>
}
