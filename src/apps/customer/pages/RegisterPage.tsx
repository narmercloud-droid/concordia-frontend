import React, { useState } from "react"
import { registerCustomer } from "@/api/customerAuth"
import { useAuthStore } from "@/context/authStore"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = async () => {
    try {
      const result = await registerCustomer({ name, email, password })
      setToken(result.accessToken)
      setUser(result.user)

      const redirect = searchParams.get("redirect")
      navigate(redirect || "/customer/checkout")
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ??
        err.response?.data?.message ??
        t("auth.registerFailed")
      setError(message)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p className="customer-hint">{t("auth.loyaltyBenefits")}</p>
      <ul className="checkout-marketing__perks">
        <li>{t("checkout.loyaltyPerkPoints")}</li>
        <li>{t("checkout.loyaltyPerkTier")}</li>
        <li>{t("checkout.marketingPerkBirthday")}</li>
      </ul>

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
        <Link
          to={`/customer/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
          style={{ color: "var(--c-accent)" }}
        >
          {t("auth.login")}
        </Link>
      </p>
    </div>
  )
}
