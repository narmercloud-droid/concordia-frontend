import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCartStore } from "@/store/cartStore"
import { isNativeApp } from "@/lib/nativeApp"
import { formatCurrency } from "@/utils/format"

export default function NativeCartBar() {
  const { t } = useTranslation()
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = useCartStore((s) => s.total())

  if (!isNativeApp()) return null
  if (itemCount === 0) return null
  if (location.pathname.startsWith("/customer/checkout")) return null

  const onBranchMenu = location.pathname.startsWith("/branch/")
  const onCart = location.pathname === "/customer/cart"
  if (!onBranchMenu && !onCart) return null

  const checkoutPath = "/customer/checkout"

  return (
    <div className="native-cart-bar" role="region" aria-label={t("nativeApp.cartBar.label")}>
      <div className="native-cart-bar__summary">
        <span className="native-cart-bar__count">
          {t("nativeApp.cartBar.items", { count: itemCount })}
        </span>
        <span className="native-cart-bar__total">{formatCurrency(subtotal)}</span>
      </div>
      <div className="native-cart-bar__actions">
        {!onCart ? (
          <Link to="/customer/cart" className="native-cart-bar__secondary">
            {t("layout.cart")}
          </Link>
        ) : null}
        <Link to={checkoutPath} className="native-cart-bar__cta">
          {t("cart.checkout")}
        </Link>
      </div>
    </div>
  )
}
