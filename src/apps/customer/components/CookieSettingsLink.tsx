import React from "react"
import { useTranslation } from "react-i18next"
import { requestCookieSettings } from "@/apps/customer/components/CookieConsent"

type Props = {
  className?: string
}

export default function CookieSettingsLink({ className }: Props) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className={className ?? "cookie-settings-link"}
      onClick={() => requestCookieSettings()}
    >
      {t("legal.cookie.settings")}
    </button>
  )
}
