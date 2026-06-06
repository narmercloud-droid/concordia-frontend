import React from "react"
import { useTranslation } from "react-i18next"

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="customer-page" style={{ textAlign: "center", paddingTop: 48 }}>
      <h2 className="customer-title">{t("common.notFound")}</h2>
    </div>
  )
}
