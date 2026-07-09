import React from "react"
import { useAuthStore } from "@/context/authStore"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || !user?.id) return <Navigate to="/customer/login" replace />

  return children
}
