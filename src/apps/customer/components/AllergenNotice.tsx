import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function AllergenNotice() {
  const { t } = useTranslation()

  return (
    <aside className="allergen-notice" role="note">
      <h3 className="allergen-notice__title">{t("menu.allergenTitle")}</h3>
      <p className="allergen-notice__text">{t("menu.allergenLead")}</p>
      <p className="allergen-notice__legend">{t("menu.allergenLegend")}</p>
      <p className="allergen-notice__contact">
        <Link to="/contact">{t("menu.allergenContact")}</Link>
      </p>
    </aside>
  )
}
