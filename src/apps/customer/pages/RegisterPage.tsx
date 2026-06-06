import React, { useState } from "react"
import api from "@/api/client"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function RegisterPage() {
  const { t } = useTranslation()
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
      setError(err.response?.data?.message || t("auth.registerFailed"))
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="customer-field">
        <label className="customer-label">{t("auth.name")}</label>
        <input
          className="customer-input"
          placeholder={t("auth.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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

      <button type="button" className="customer-btn customer-btn--primary" onClick={handleRegister}>
        {t("auth.register")}
      </button>

      <p className="customer-hint" style={{ textAlign: "center" }}>
        {t("auth.hasAccount")}{" "}
        <Link to="/customer/login" style={{ color: "var(--c-accent)" }}>
          {t("auth.login")}
        </Link>
      </p>
    </div>
  )
}
