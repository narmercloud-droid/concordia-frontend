import React from "react"
import { useTranslation } from "react-i18next"
import type { BranchOwnerBranding } from "@/lib/branchBranding"

type Props = {
  branding: BranchOwnerBranding
  branchName: string
}

export default function BranchOwnerWelcome({ branding, branchName }: Props) {
  const { t } = useTranslation()

  return (
    <section className="branch-owner">
      <div className="branch-owner__card">
        <div className="branch-owner__visual">
          <img
            src={branding.cartoonImage}
            alt={t("branchOwner.cartoonAlt")}
            className="branch-owner__cartoon"
            width={96}
            height={96}
          />
          <img
            src={branding.photoImage}
            alt={t("branchOwner.photoAlt", { branch: branchName })}
            className="branch-owner__photo"
            width={72}
            height={72}
            loading="lazy"
          />
        </div>
        <div className="branch-owner__copy">
          <p className="branch-owner__eyebrow">{t("branchOwner.eyebrow")}</p>
          <h2 className="branch-owner__title">{t("branchOwner.welcome", { branch: branchName })}</h2>
          <p className="branch-owner__message">{t("branchOwner.message")}</p>
        </div>
      </div>
    </section>
  )
}
