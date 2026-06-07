import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { INFO_PAGES } from "@/lib/infoPages"
import "./InfoPages.css"

type Props = {
  className?: string
}

export default function SiteNav({ className = "" }: Props) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav
      className={`site-nav site-nav--bar ${className}`.trim()}
      aria-label={t("pages.navLabel")}
    >
      <div className="site-nav__scroll">
        <Link
          to="/"
          className={`site-nav__link${location.pathname === "/" ? " site-nav__link--active" : ""}`}
        >
          {t("pages.nav.home")}
        </Link>
        {INFO_PAGES.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className={`site-nav__link${
              location.pathname === page.path ? " site-nav__link--active" : ""
            }`}
          >
            {t(`pages.nav.${page.key}`)}
          </Link>
        ))}
        <a
          href={location.pathname === "/" ? "#order" : "/#order"}
          className="site-nav__link site-nav__link--cta"
        >
          {t("home.orderNow")}
        </a>
      </div>
    </nav>
  )
}
