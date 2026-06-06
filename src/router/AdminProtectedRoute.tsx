import { useAdminAuthStore } from "@/context/adminAuthStore"
import { Navigate } from "react-router-dom"

export default function AdminProtectedRoute({ children }: any) {
  const token = useAdminAuthStore((s) => s.token)

  if (!token) return <Navigate to="/admin/login" replace />

  return children
}
