import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import { branchesQueryOptions } from "@/lib/branchesQuery"
import { BRANCH_CONTACT } from "@/lib/branchContact"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import ContactFormSection from "@/apps/customer/components/ContactFormSection"

type Branch = {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  comingSoon?: boolean
}

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

function formatAddress(branch: Branch) {
  const line = [branch.address, [branch.postalCode, branch.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
  return line || null
}

export default function ContactPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    ...branchesQueryOptions
  })

  const branches = (data ?? []) as Branch[]

  return (
    <InfoPageShell eyebrow={t("pages.contact.eyebrow")} title={t("pages.contact.title")}>
      <div className="info-block">
        <p>{t("pages.contact.lead")}</p>
      </div>

      {!isLoading && branches.length > 0 && <ContactFormSection branches={branches} />}

      {isLoading ? (
        <p className="customer-text">{t("common.loading")}</p>
      ) : (
        branches.map((branch) => {
          const contact = BRANCH_CONTACT[branch.id]
          const address = formatAddress(branch)

          return (
            <div key={branch.id} className="info-block info-contact-card">
              <h3>{branchDisplayName(branch.name)}</h3>

              {branch.comingSoon && (
                <p className="info-contact-card__badge">{t("home.comingSoonLabel")}</p>
              )}

              <dl className="info-contact-card__details">
                {address && (
                  <>
                    <dt>{t("pages.contact.address")}</dt>
                    <dd>{address}</dd>
                  </>
                )}

                {contact && (
                  <>
                    <dt>{t("pages.contact.phone")}</dt>
                    <dd>
                      <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
                    </dd>

                    <dt>{t("pages.contact.email")}</dt>
                    <dd>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </dd>

                    <dt>{t("pages.contact.maps")}</dt>
                    <dd>
                      <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                        {t("pages.contact.viewOnMaps")}
                      </a>
                    </dd>
                  </>
                )}
              </dl>

              {!contact && !address && (
                <p className="info-contact-card__empty">{t("pages.contact.detailsPending")}</p>
              )}
            </div>
          )
        })
      )}

      <div className="info-block">
        <p>{t("pages.contact.emailHint")}</p>
      </div>
    </InfoPageShell>
  )
}
