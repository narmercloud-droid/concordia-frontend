import React from "react"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import "../customer.css"

export default function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="customer-shell" style={{ maxWidth: 420, margin: "0 auto", padding: "32px 20px 48px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <LanguageSwitcher />
      </div>
      <h2 className="customer-title" style={{ textAlign: "center" }}>
        {t("auth.loginTitle")}
      </h2>
      <Outlet />
    </div>
  )
}
