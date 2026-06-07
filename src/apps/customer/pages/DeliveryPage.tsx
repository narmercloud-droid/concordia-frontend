import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"

const DELIVERY_AREAS = [
  { postcode: "41749", min: "€30", fee: "€2" },
  { postcode: "47647", min: "€20", fee: "€2" },
  { postcode: "47669", min: "€20", fee: "€2" },
  { postcode: "47839", min: "€30", fee: "€2" },
  { postcode: "47906", min: "€15", fee: "€2" },
  { postcode: "47918", min: "€20", fee: "€2" },
  { postcode: "47929", min: "€20", fee: "€2" }
]

export default function DeliveryPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.delivery.eyebrow")} title={t("pages.delivery.title")}>
      <div className="info-block">
        <p>{t("pages.delivery.lead")}</p>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.delivery.areasTitle")}</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="info-table">
            <thead>
              <tr>
                <th>{t("pages.delivery.colPostcode")}</th>
                <th>{t("pages.delivery.colMin")}</th>
                <th>{t("pages.delivery.colFee")}</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_AREAS.map((area) => (
                <tr key={area.postcode}>
                  <td>{area.postcode}</td>
                  <td>{area.min}</td>
                  <td>{area.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.delivery.pickupTitle")}</h2>
        <p>{t("pages.delivery.pickupText")}</p>
        <Link to="/#order" className="info-cta">
          {t("home.orderNow")}
        </Link>
      </div>
    </InfoPageShell>
  )
}
