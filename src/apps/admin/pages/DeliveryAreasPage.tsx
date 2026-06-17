import React from "react"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import BranchDeliveryEditor from "../components/BranchDeliveryEditor"

export default function DeliveryAreasPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const canEdit = can("delivery_edit")

  return <BranchDeliveryEditor branchId={branchId} canEdit={canEdit} />
}
