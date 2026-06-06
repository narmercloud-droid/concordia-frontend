import { Navigate, useParams } from "react-router-dom"
import { branchItemPath, branchPath } from "@/lib/customerPaths"

export function RedirectCustomerBranch() {
  const { branchId } = useParams()
  if (!branchId) return <Navigate to="/customer" replace />
  return <Navigate to={branchPath(branchId)} replace />
}

export function RedirectCustomerBranchItem() {
  const { branchId, itemId } = useParams()
  if (!branchId || !itemId) return <Navigate to="/customer" replace />
  return <Navigate to={branchItemPath(branchId, itemId)} replace />
}
