import React from "react"
import { useTranslation } from "react-i18next"

type Props = {
  className?: string
}

/** PAngV: prices include statutory VAT (B2C food retail). */
export default function PriceVatNote({ className }: Props) {
  const { t } = useTranslation()
  return <p className={className ?? "price-vat-note"}>{t("legal.priceInclVat")}</p>
}
