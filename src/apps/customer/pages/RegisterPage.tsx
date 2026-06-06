import React, { useState } from "react"
import api from "@/api/client"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Link, useNavigate } from "react-router-dom"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { name, email, password })
      navigate("/customer/login")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input
        placeholder="Name"
        value={name}
        onChange={(e: any) => setName(e.target.value)}
      />
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

      <Button onClick={handleRegister}>Register</Button>

      <div style={{ marginTop: 10 }}>
        Already have an account? <Link to="/customer/login">Login</Link>
      </div>
    </div>
  )
}
