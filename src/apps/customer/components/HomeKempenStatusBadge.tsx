import React from "react"
import { useTranslation } from "react-i18next"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import type { HomeBranch } from "@/apps/customer/components/HomeOrderHub"

type Props = {
  branches: HomeBranch[]
  className?: string
}

export default function HomeKempenStatusBadge({ branches, className = "" }: Props) {
  const { t } = useTranslation()
  const kempen = branches.find((branch) => branch.id === KEMPEN_BRANCH_ID)

  if (!kempen || kempen.comingSoon || kempen.isOpen == null) return null

  const open = !!kempen.isOpen

  return (
    <span
      className={`home-kempen-status ${open ? "home-kempen-status--open" : "home-kempen-status--closed"} ${className}`.trim()}
      role="status"
    >
      <span className="home-kempen-status__dot" aria-hidden />
      {open ? t("home.openNow") : t("home.closed")} · {t("home.kempenBranch")}
    </span>
  )
}
