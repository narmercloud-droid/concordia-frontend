import React, { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import { useCartStore } from "@/store/cartStore"
import { subscribeToPush } from "@/utils/pushNotifications"
import "../customer.css"

export default function CustomerLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [pushDenied, setPushDenied] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const onCartPage = location.pathname === "/customer/cart"
  const onHomePage = location.pathname === "/"

  useEffect(() => {
    if (!("Notification" in window)) return

    if (Notification.permission === "denied") {
      setPushDenied(true)
      return
    }

    subscribeToPush().catch(() => {})
  }, [])

  return (
    <div
      className={`customer-shell${onHomePage ? " customer-shell--home" : ""}`}
      style={{ maxWidth: onHomePage ? 980 : 720, margin: "0 auto", padding: "24px 20px 48px" }}
    >
      <header className="customer-header">
        <Link to="/" className="customer-header__brand">
          <ConcordiaLogo size="sm" />
        </Link>
        <div className="customer-header__actions">
          <LanguageSwitcher />
          <Link
            to="/customer/cart"
            className={`customer-cart-link${onCartPage ? " customer-cart-link--active" : ""}`}
          >
            {itemCount > 0 ? t("layout.cartWithCount", { count: itemCount }) : t("layout.cart")}
          </Link>
        </div>
      </header>

      {pushDenied && (
        <div className="customer-alert customer-alert--warn">{t("layout.notificationsDisabled")}</div>
      )}

      <main style={{ marginTop: 20 }}>
        <Outlet />
      </main>
    </div>
  )
}
