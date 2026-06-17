import React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getManagerBranch, updateManagerBranchStatus } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import BranchHoursEditor from "../components/BranchHoursEditor"

export default function HoursPage() {
  const { branchId } = useAdminBranch()
  const { can, isSuperAdmin } = useAdminPermissions()
  const canEdit = can("hours_edit")
  const queryClient = useQueryClient()

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["managerBranch", branchId],
    queryFn: () => getManagerBranch(branchId),
    enabled: !!branchId
  })

  const branchStatus = branch?.status === "coming_soon" ? "coming_soon" : "live"

  const statusMutation = useMutation({
    mutationFn: (status: "live" | "coming_soon") =>
      updateManagerBranchStatus(status, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerBranch", branchId] })
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })

  if (branchLoading) return <p>Loading hours...</p>

  return (
    <div>
      {isSuperAdmin && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            background: "#f7f4ff",
            border: "1px solid #e8e0f5",
            borderRadius: 8,
            maxWidth: 640
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Branch visibility (super admin)</h3>
          <p style={{ margin: "0 0 12px", color: "#666", fontSize: 14 }}>
            <strong>Active</strong> — customers can order (opening hours still apply).{" "}
            <strong>Inactive</strong> — branch shows as coming soon and cannot accept orders.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={statusMutation.isPending || branchStatus === "live"}
              onClick={() => statusMutation.mutate("live")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #1b7340",
                background: branchStatus === "live" ? "#1b7340" : "white",
                color: branchStatus === "live" ? "white" : "#1b7340",
                cursor: statusMutation.isPending || branchStatus === "live" ? "default" : "pointer"
              }}
            >
              Active — order now
            </button>
            <button
              type="button"
              disabled={statusMutation.isPending || branchStatus === "coming_soon"}
              onClick={() => statusMutation.mutate("coming_soon")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #e65100",
                background: branchStatus === "coming_soon" ? "#e65100" : "white",
                color: branchStatus === "coming_soon" ? "white" : "#e65100",
                cursor:
                  statusMutation.isPending || branchStatus === "coming_soon" ? "default" : "pointer"
              }}
            >
              Inactive — coming soon
            </button>
          </div>
          {statusMutation.isError && (
            <p style={{ color: "#b00020", marginTop: 12, marginBottom: 0, fontSize: 14 }}>
              {(statusMutation.error as any)?.response?.data?.error?.message ??
                (statusMutation.error as any)?.response?.data?.message ??
                "Could not update branch status. Try again."}
            </p>
          )}
        </div>
      )}

      <BranchHoursEditor branchId={branchId} canEdit={canEdit} />
    </div>
  )
}
