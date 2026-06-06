import { useAuthStore } from "@/context/authStore"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: any) {
  const token = useAuthStore((s) => s.token)

  if (!token) return <Navigate to="/customer/login" replace />

  return children
}
