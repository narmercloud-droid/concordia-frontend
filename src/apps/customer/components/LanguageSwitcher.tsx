import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ensureLocaleLoaded } from "@/i18n/index"
import {
  getLanguage,
  LANGUAGES,
  persistLanguageChoice,
  type AppLanguage
} from "@/i18n/languages"

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = (i18n.language?.split("-")[0] ?? "de") as AppLanguage
  const active = getLanguage(current)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  const selectLanguage = (code: AppLanguage) => {
    setOpen(false)
    void (async () => {
      persistLanguageChoice(code)
      await ensureLocaleLoaded(code)
      await i18n.changeLanguage(code)
    })()
  }

  return (
    <div className="lang-switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-switcher__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
      >
        <span className="lang-switcher__flag" aria-hidden="true">
          {active.flag}
        </span>
        <span className="lang-switcher__name">{active.native}</span>
      </button>

      {open && (
        <ul className="lang-switcher__menu" role="listbox" aria-label={t("lang.label")}>
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                className={`lang-switcher__option${
                  lang.code === current ? " lang-switcher__option--active" : ""
                }`}
                onClick={() => selectLanguage(lang.code)}
              >
                <span className="lang-switcher__flag" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="lang-switcher__name">{lang.native}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
