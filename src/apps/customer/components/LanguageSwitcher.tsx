import React from "react"
import { useTranslation } from "react-i18next"
import { LANGUAGES, type AppLanguage } from "@/i18n/languages"

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = (i18n.language?.split("-")[0] ?? "de") as AppLanguage

  return (
    <label className="lang-switcher">
      <span className="lang-switcher__label">{t("lang.label")}</span>
      <select
        className="lang-switcher__select"
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t("lang.label")}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
    </label>
  )
}
