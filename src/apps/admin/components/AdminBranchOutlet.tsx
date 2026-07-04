import React from "react"
import { Outlet } from "react-router-dom"
import { useAdminBranch } from "@/hooks/useAdminBranch"

/** Remount admin pages when the active branch changes so local form state cannot go stale. */
export default function AdminBranchOutlet() {
  const { branchId } = useAdminBranch()
  return <Outlet key={branchId ?? "no-branch"} />
}
