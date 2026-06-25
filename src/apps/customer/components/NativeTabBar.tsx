import React from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/context/authStore"
import { useCartStore } from "@/store/cartStore"
import { isNativeApp } from "@/lib/nativeApp"
import {
  NativeTabAccountIcon,
  NativeTabHomeIcon,
  NativeTabOffersIcon,
  NativeTabOrderIcon
} from "@/apps/customer/components/NativeTabIcons"

const TAB_ICONS = {
  home: NativeTabHomeIcon,
  offers: NativeTabOffersIcon,
  order: NativeTabOrderIcon,
  account: NativeTabAccountIcon
} as const

export default function NativeTabBar() {
  const { t } = useTranslation()
  const location = useLocation()
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const isLoggedIn = !!useAuthStore((s) => s.token) && !!useAuthStore((s) => s.user?.id)

  if (!isNativeApp()) return null
  if (location.pathname.startsWith("/customer/checkout")) return null
  if (location.pathname.startsWith("/admin")) return null

  const tabs = [
    { key: "home", to: "/", labelKey: "nativeApp.tabs.home", icon: "home" },
    { key: "offers", to: "/offers", labelKey: "nativeApp.tabs.offers", icon: "offers" },
    { key: "order", to: { pathname: "/", hash: "order" }, labelKey: "nativeApp.tabs.order", icon: "order" },
    {
      key: "account",
      to: isLoggedIn ? "/customer/settings" : "/customer/login",
      labelKey: "nativeApp.tabs.account",
      icon: "account"
    }
  ] as const

  return (
    <nav className="native-tab-bar" aria-label={t("nativeApp.tabs.label")}>
      {tabs.map((tab) => {
        const href = typeof tab.to === "string" ? tab.to : tab.to.pathname
        const active =
          tab.key === "home"
            ? location.pathname === "/"
            : tab.key === "order"
              ? location.pathname === "/" || location.pathname.startsWith("/branch/")
              : tab.key === "account"
                ? location.pathname.startsWith("/customer/login") ||
                  location.pathname.startsWith("/customer/register") ||
                  location.pathname.startsWith("/customer/settings")
                : location.pathname === href

        const Icon = TAB_ICONS[tab.icon]
        const isOrder = tab.key === "order"

        return (
          <Link
            key={tab.key}
            to={tab.to}
            className={`native-tab-bar__item native-tab-bar__item--${tab.key}${
              active ? " native-tab-bar__item--active" : ""
            }`}
          >
            <span className="native-tab-bar__icon-wrap">
              <Icon className="native-tab-bar__icon" />
            </span>
            <span className="native-tab-bar__label">{t(tab.labelKey)}</span>
            {isOrder && itemCount > 0 ? (
              <span className="native-tab-bar__badge">{itemCount}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
