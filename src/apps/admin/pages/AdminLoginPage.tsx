import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { adminLogin } from "@/api/adminAuth"
import { getManagerSession } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { useNavigate } from "react-router-dom"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setToken = useAdminAuthStore((s) => s.setToken)
  const setAdmin = useAdminAuthStore((s) => s.setAdmin)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    try {
      const res = await adminLogin({ email, password })
      const { accessToken, admin } = res.data

      if (!accessToken || !admin) {
        setError("Login failed — unexpected server response")
        return
      }

      setToken(accessToken)
      setAdmin(admin)

      void queryClient.prefetchQuery({
        queryKey: ["managerSession"],
        queryFn: getManagerSession,
        staleTime: 5 * 60_000
      })

      navigate("/admin")
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input
        placeholder="Email"
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
      />

      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />

      {error && <div style={{ color: "red" }}>{error}</div>}

      <Button onClick={handleLogin}>Login</Button>
    </div>
  )
}
