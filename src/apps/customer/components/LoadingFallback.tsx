import React from "react"
import { useTranslation } from "react-i18next"

export default function LoadingFallback() {
  const { t } = useTranslation()
  return <p className="customer-loading">{t("common.loading")}</p>
}
