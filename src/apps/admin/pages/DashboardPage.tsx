import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getManagerDashboard, getManagerBranch } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"

export default function DashboardPage() {
  const { admin, branchId } = useAdminBranch()

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["managerBranch", branchId],
    queryFn: () => getManagerBranch(branchId ?? undefined),
    enabled: !!branchId
  })

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ["managerDashboard", branchId],
    queryFn: () => getManagerDashboard(branchId),
    enabled: !!branchId
  })

  const stats = statsRes?.data?.data
  const isLoading = branchLoading || statsLoading

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      <h2>{branch?.name ?? "Branch dashboard"}</h2>
      <p style={{ color: "#666" }}>
        Logged in as {admin?.name} ({admin?.role})
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
        <div style={{ padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats?.pendingOrders ?? 0}</div>
          <div>Active orders</div>
        </div>
        <div style={{ padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats?.todayOrders ?? 0}</div>
          <div>Orders today</div>
        </div>
        <div style={{ padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            €{(stats?.todayRevenue ?? 0).toFixed(2)}
          </div>
          <div>Revenue today</div>
        </div>
      </div>

      {branch?.terminalCode && (
        <p style={{ marginTop: 24 }}>
          Sunmi terminal code: <strong>{branch.terminalCode}</strong>
        </p>
      )}
    </div>
  )
}
