import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBranches } from "@/api/customer"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { useAdminBranchStore } from "@/context/adminBranchStore"

type BranchRow = { id: string; name?: string }

export function useAdminBranch() {
  const admin = useAdminAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "admin"
  const selectedBranchId = useAdminBranchStore((s) => s.selectedBranchId)
  const setSelectedBranchId = useAdminBranchStore((s) => s.setSelectedBranchId)

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: isSuperAdmin
  })

  const branchList = branches as BranchRow[]
  const fallbackBranchId = branchList[0]?.id ?? "concordia-kempen"

  useEffect(() => {
    if (!isSuperAdmin || branchList.length === 0) return

    const validIds = new Set(branchList.map((b) => b.id))
    if (selectedBranchId && validIds.has(selectedBranchId)) return

    setSelectedBranchId(fallbackBranchId)
  }, [isSuperAdmin, branchList, selectedBranchId, fallbackBranchId, setSelectedBranchId])

  const effectiveBranchId = isSuperAdmin
    ? selectedBranchId && branchList.some((b) => b.id === selectedBranchId)
      ? selectedBranchId
      : fallbackBranchId
    : admin?.branchId ?? undefined

  const currentBranch = branchList.find((b) => b.id === effectiveBranchId)

  return {
    admin,
    isSuperAdmin,
    branchId: effectiveBranchId,
    branchName: currentBranch?.name ?? effectiveBranchId,
    branches: branchList,
    setSelectedBranchId
  }
}
