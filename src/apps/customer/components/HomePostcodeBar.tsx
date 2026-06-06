import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { getBranchDeliveryAreas } from "@/api/customer"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import { formatCurrency } from "@/utils/format"

type Props = {
  branchId?: string | null
}

export default function HomePostcodeBar({ branchId }: Props) {
  const { t } = useTranslation()
  const [postalCode, setPostalCode] = useState("")
  const [checked, setChecked] = useState<string | null>(null)

  const activeBranch = branchId ?? KEMPEN_BRANCH_ID

  const { data } = useQuery({
    queryKey: ["deliveryAreas", activeBranch],
    queryFn: () => getBranchDeliveryAreas(activeBranch),
    enabled: !!activeBranch
  })

  const areas = data?.areas ?? []
  const match = checked
    ? areas.find((a) => a.postalCode === checked)
    : null

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const plz = postalCode.trim()
    if (plz.length >= 4) setChecked(plz)
  }

  return (
    <section className="home-postcode">
      <p className="home-postcode__label">{t("home.postcodeLabel")}</p>
      <form className="home-postcode__form" onSubmit={handleCheck}>
        <input
          type="text"
          inputMode="numeric"
          className="home-postcode__input"
          placeholder={t("home.postcodePlaceholder")}
          value={postalCode}
          onChange={(e) => {
            setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))
            setChecked(null)
          }}
          aria-label={t("home.postcodePlaceholder")}
        />
        <button type="submit" className="home-postcode__btn">
          {t("home.postcodeCheck")}
        </button>
      </form>
      {checked && match && (
        <p className="home-postcode__result home-postcode__result--ok">
          {t("home.postcodeYes", { plz: checked })}
          {match.minimumOrder > 0 && (
            <span>
              {" "}
              · {t("home.postcodeMin", { amount: formatCurrency(match.minimumOrder) })}
            </span>
          )}
        </p>
      )}
      {checked && !match && (
        <p className="home-postcode__result home-postcode__result--no">{t("home.postcodeNo")}</p>
      )}
    </section>
  )
}
