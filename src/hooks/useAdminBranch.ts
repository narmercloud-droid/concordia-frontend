import { useQuery } from "@tanstack/react-query"
import { getBranches } from "@/api/customer"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { useAdminBranchStore } from "@/context/adminBranchStore"

export function useAdminBranch() {
  const admin = useAdminAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "admin"
  const selectedBranchId = useAdminBranchStore((s) => s.selectedBranchId)
  const setSelectedBranchId = useAdminBranchStore((s) => s.setSelectedBranchId)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: isSuperAdmin
  })

  const fallbackBranch = branches?.[0]?.id ?? "concordia-kempen"
  const effectiveBranchId = isSuperAdmin
    ? selectedBranchId ?? admin?.branchId ?? fallbackBranch
    : admin?.branchId ?? undefined

  const currentBranch = branches?.find((b: { id: string }) => b.id === effectiveBranchId)

  return {
    admin,
    isSuperAdmin,
    branchId: effectiveBranchId,
    branchName: currentBranch?.name ?? effectiveBranchId,
    branches: branches ?? [],
    setSelectedBranchId
  }
}
