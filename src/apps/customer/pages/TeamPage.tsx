import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import ConcordiaWordmark from "@/apps/customer/components/ConcordiaWordmark"
import { TEAM_MEMBER_PHOTOS } from "@/lib/branchBranding"

const TEAM_MEMBER_KEYS = ["director", "pizzaChef1", "pizzaChef2", "pizzaChef3", "kitchenChef"] as const

export default function TeamPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.team.eyebrow")} title={t("pages.team.title")}>
      <p className="team-lead">{t("pages.team.lead")}</p>

      <div className="team-hero-mark">
        <ConcordiaWordmark variant="footer" />
      </div>

      <div className="team-grid">
        {TEAM_MEMBER_KEYS.map((key) => (
          <article key={key} className="team-card">
            <div className="team-card__photo-wrap">
              <img
                src={TEAM_MEMBER_PHOTOS[key]}
                alt={t(`pages.team.members.${key}.photoAlt`)}
                className="team-card__photo"
                width={160}
                height={160}
                loading="lazy"
              />
            </div>
            <h2 className="team-card__name">{t(`pages.team.members.${key}.name`)}</h2>
            <p className="team-card__role">{t(`pages.team.members.${key}.role`)}</p>
            <p className="team-card__bio">{t(`pages.team.members.${key}.bio`)}</p>
          </article>
        ))}
      </div>

      <section className="team-cta">
        <p>{t("pages.team.ctaText")}</p>
        <OrderNowLink className="info-cta">{t("home.orderNow")}</OrderNowLink>
      </section>
    </InfoPageShell>
  )
}
