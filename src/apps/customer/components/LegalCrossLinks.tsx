import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LEGAL_PAGES } from "@/lib/infoPages"

export default function LegalCrossLinks({ current }: { current?: string }) {
  const { t } = useTranslation()

  return (
    <nav className="info-legal__crosslinks" aria-label={t("pages.legalNavLabel")}>
      {LEGAL_PAGES.map((page) => (
        <Link
          key={page.path}
          to={page.path}
          className={current === page.path ? "is-active" : undefined}
          aria-current={current === page.path ? "page" : undefined}
        >
          {t(`pages.nav.${page.key}`)}
        </Link>
      ))}
    </nav>
  )
}
