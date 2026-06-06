import React, { useState } from "react"
import { login } from "@/api/auth"
import { useAuthStore } from "@/context/authStore"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function LoginPage() {
  const { t } = useTranslation()
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
      setError(err.response?.data?.message || t("auth.loginFailed"))
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="customer-field">
        <label className="customer-label">{t("auth.email")}</label>
        <input
          className="customer-input"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="customer-field">
        <label className="customer-label">{t("auth.password")}</label>
        <input
          className="customer-input"
          type="password"
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="customer-alert customer-alert--error">{error}</div>}

      <button type="button" className="customer-btn customer-btn--primary" onClick={handleLogin}>
        {t("auth.login")}
      </button>

      <p className="customer-hint" style={{ textAlign: "center" }}>
        {t("auth.noAccount")}{" "}
        <Link to="/customer/register" style={{ color: "var(--c-accent)" }}>
          {t("auth.register")}
        </Link>
      </p>
    </div>
  )
}
