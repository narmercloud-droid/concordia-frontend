import React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSuperAdminBranches,
  updateSuperAdminBranchStatus,
  type SuperAdminBranch
} from "@/api/superAdmin"
import AdminTable from "../components/AdminTable.js"

function statusLabel(status: string) {
  return status === "coming_soon" ? "Coming soon" : "Order now (live)"
}

export default function BranchesPage() {
  const queryClient = useQueryClient()

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["superAdminBranches"],
    queryFn: getSuperAdminBranches
  })

  const statusMutation = useMutation({
    mutationFn: ({ branchId, status }: { branchId: string; status: "live" | "coming_soon" }) =>
      updateSuperAdminBranchStatus(branchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminBranches"] })
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })

  const columns = [
    { key: "name", label: "Branch" },
    {
      key: "city",
      label: "City",
      render: (row: SuperAdminBranch) => row.city ?? "—"
    },
    {
      key: "status",
      label: "Website status",
      render: (row: SuperAdminBranch) => (
        <span
          style={{
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 13,
            background: row.status === "live" ? "#e8f5e9" : "#fff3e0",
            color: row.status === "live" ? "#1b5e20" : "#e65100"
          }}
        >
          {statusLabel(row.status)}
        </span>
      )
    },
    {
      key: "actions",
      label: "Customer sees",
      render: (row: SuperAdminBranch) => {
        const isLive = row.status === "live"
        const busy = statusMutation.isPending && statusMutation.variables?.branchId === row.id

        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={busy || isLive}
              onClick={() => statusMutation.mutate({ branchId: row.id, status: "live" })}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #1b7340",
                background: isLive ? "#1b7340" : "white",
                color: isLive ? "white" : "#1b7340",
                cursor: busy || isLive ? "default" : "pointer"
              }}
            >
              Order now
            </button>
            <button
              type="button"
              disabled={busy || !isLive}
              onClick={() => statusMutation.mutate({ branchId: row.id, status: "coming_soon" })}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #e65100",
                background: !isLive ? "#e65100" : "white",
                color: !isLive ? "white" : "#e65100",
                cursor: busy || !isLive ? "default" : "pointer"
              }}
            >
              Coming soon
            </button>
          </div>
        )
      }
    }
  ]

  if (isLoading) return <p>Loading branches…</p>

  return (
    <div>
      <h2>Branches</h2>
      <p style={{ color: "#666", maxWidth: 640, marginBottom: 20 }}>
        Control whether customers can order from each restaurant on the homepage.{" "}
        <strong>Order now</strong> shows the branch as orderable (still respects opening hours).{" "}
        <strong>Coming soon</strong> greys out the branch and blocks ordering.
      </p>

      {statusMutation.isError && (
        <p style={{ color: "#b00020", marginBottom: 16 }}>
          Could not update branch status. Try again.
        </p>
      )}

      <AdminTable columns={columns} data={branches} />
    </div>
  )
}
