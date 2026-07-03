import React from "react"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import "../customer.css"
import "../customer-mobile.css"

export default function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="customer-shell customer-shell--layout customer-shell--auth">
      <div className="customer-auth__top">
        <LanguageSwitcher />
      </div>
      <h2 className="customer-title customer-auth__title">
        {t("auth.loginTitle")}
      </h2>
      <Outlet />
      <div className="customer-layout-legal-footer">
        <CheckoutLegalFooter />
      </div>
    </div>
  )
}
