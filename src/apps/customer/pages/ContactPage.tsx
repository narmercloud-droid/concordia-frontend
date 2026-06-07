import React from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import { branchesQueryOptions } from "@/lib/branchesQuery"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import { branchPath } from "@/lib/customerPaths"

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

export default function ContactPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    ...branchesQueryOptions
  })

  const branches = ((data ?? []) as Branch[]).filter((b) => b.id !== "branch-001")

  return (
    <InfoPageShell eyebrow={t("pages.contact.eyebrow")} title={t("pages.contact.title")}>
      <div className="info-block">
        <p>{t("pages.contact.lead")}</p>
      </div>

      {isLoading ? (
        <p className="customer-text">{t("common.loading")}</p>
      ) : (
        branches.map((branch) => (
          <div key={branch.id} className="info-block info-contact-card">
            <h3>{branchDisplayName(branch.name)}</h3>
            {(branch.address || branch.city) && (
              <p>
                {[branch.address, [branch.postalCode, branch.city].filter(Boolean).join(" ")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {branch.comingSoon ? (
              <p>{t("home.comingSoonLabel")}</p>
            ) : (
              <Link to={branchPath(branch.id)} className="info-cta">
                {t("home.orderNow")}
              </Link>
            )}
          </div>
        ))
      )}

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.contact.emailTitle")}</h2>
        <p>
          <a href="mailto:kempen@concordia.de">kempen@concordia.de</a>
        </p>
        <p>{t("pages.contact.emailHint")}</p>
      </div>
    </InfoPageShell>
  )
}
