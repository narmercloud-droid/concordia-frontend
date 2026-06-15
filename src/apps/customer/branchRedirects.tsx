import { Navigate, useParams } from "react-router-dom"
import { KEMPEN_BRANCH_ID, branchItemPath, branchPath } from "@/lib/customerPaths"

export function RedirectCustomerBranch() {
  const { branchId } = useParams()
  if (!branchId) return <Navigate to="/" replace />
  return <Navigate to={branchPath(branchId)} replace />
}

export function RedirectCustomerBranchItem() {
  const { branchId, itemId } = useParams()
  if (!branchId || !itemId) return <Navigate to="/" replace />
  return <Navigate to={branchItemPath(branchId, itemId)} replace />
}

/** Legacy `/customer/menu` bookmarks → Kempen branch menu. */
export function RedirectLegacyMenu() {
  return <Navigate to={branchPath(KEMPEN_BRANCH_ID)} replace />
}

export function RedirectLegacyMenuCategory() {
  return <Navigate to={branchPath(KEMPEN_BRANCH_ID)} replace />
}

export function RedirectLegacyMenuItem() {
  const { itemId } = useParams()
  if (!itemId) return <Navigate to={branchPath(KEMPEN_BRANCH_ID)} replace />
  return <Navigate to={branchItemPath(KEMPEN_BRANCH_ID, itemId)} replace />
}

export function RedirectLegacyTrack() {
  const { orderId } = useParams()
  if (!orderId) return <Navigate to="/" replace />
  return <Navigate to={`/customer/order/${orderId}`} replace />
}
