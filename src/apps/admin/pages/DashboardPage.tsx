import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getManagerDashboard, getManagerBranch } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export default function DashboardPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const branchId = admin?.branchId ?? undefined

  const { data: branchRes } = useQuery({
    queryKey: ["managerBranch", branchId],
    queryFn: () => getManagerBranch(branchId)
  })

  const { data: statsRes, isLoading } = useQuery({
    queryKey: ["managerDashboard", branchId],
    queryFn: () => getManagerDashboard(branchId)
  })

  const branch = branchRes?.data?.data
  const stats = statsRes?.data?.data

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
