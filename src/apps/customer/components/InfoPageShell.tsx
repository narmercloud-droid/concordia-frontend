import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import SiteFooter from "@/apps/customer/components/SiteFooter"
import SiteNav from "@/apps/customer/components/SiteNav"
import "./InfoPages.css"

type Props = {
  eyebrow: string
  title: string
  children: React.ReactNode
}

export default function InfoPageShell({ eyebrow, title, children }: Props) {
  const { t } = useTranslation()

  return (
    <div className="info-page">
      <Link to="/" className="info-page__back">
        ← {t("pages.backHome")}
      </Link>
      <p className="customer-eyebrow">{eyebrow}</p>
      <h1 className="customer-title">{title}</h1>
      <div className="info-page__body">{children}</div>
      <SiteNav className="info-page__nav" />
      <SiteFooter />
    </div>
  )
}
