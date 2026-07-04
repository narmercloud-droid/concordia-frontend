import { useEffect } from "react"
import { useTranslation } from "react-i18next"

/** Keeps the browser tab title in sync with the active locale. */
export function useSiteDocumentTitle(suffix?: string) {
  const { t, i18n } = useTranslation()
  const base = t("common.siteTitle")

  useEffect(() => {
    document.title = suffix ? `${suffix} | ${base}` : base
  }, [base, suffix, i18n.language])
}
