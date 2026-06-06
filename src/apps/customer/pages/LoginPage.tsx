import React, { useState } from "react"
import { login } from "@/api/auth"
import { useAuthStore } from "@/context/authStore"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    try {
      const res = await login({ email, password })
      const { accessToken, user } = res.data

      setToken(accessToken)
      setUser(user)

      navigate("/customer/menu")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
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

      <div style={{ marginTop: 10 }}>
        No account? <Link to="/customer/register">Register</Link>
      </div>
    </div>
  )
}
