import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { useBranchStore } from "@/store/branchStore"

const BRANCH_ORDER = ["concordia-kempen", "concordia-straelen"]

type Props = {
  branchId: string | null
  onSelect: (branchId: string) => void
}

function branchLabel(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

export default function BranchCouponTabs({ branchId, onSelect }: Props) {
  const { t } = useTranslation()
  const { data } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branches = (Array.isArray(data) ? data : [])
    .filter((b: { id: string; comingSoon?: boolean }) => !b.comingSoon)
    .sort(
      (a: { id: string }, b: { id: string }) =>
        BRANCH_ORDER.indexOf(a.id) - BRANCH_ORDER.indexOf(b.id)
    )

  if (branches.length <= 1) return null

  return (
    <div className="branch-coupon-tabs" role="tablist" aria-label={t("coupons.chooseBranch")}>
      {branches.map((branch: { id: string; name: string }) => (
        <button
          key={branch.id}
          type="button"
          role="tab"
          aria-selected={branchId === branch.id}
          className={`branch-coupon-tabs__tab${
            branchId === branch.id ? " branch-coupon-tabs__tab--active" : ""
          }`}
          onClick={() => onSelect(branch.id)}
        >
          {branchLabel(branch.name)}
        </button>
      ))}
    </div>
  )
}

/** Default branch when none selected yet. */
export function useDefaultCouponBranch() {
  const stored = useBranchStore((s) => s.selectedBranchId)
  return stored ?? "concordia-kempen"
}
