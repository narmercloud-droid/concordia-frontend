import React from "react"
import { useAuthStore } from "@/context/authStore"
import { Navigate, useLocation } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!token || !user?.id) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/customer/login?redirect=${redirect}`} replace />
  }

  return children
}
