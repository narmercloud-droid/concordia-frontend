import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  exportManagerCustomers,
  getManagerCustomerOrders,
  getManagerCustomers,
  runManagerAutomation
} from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"

export default function CustomersPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const [search, setSearch] = useState("")
  const [marketingOnly, setMarketingOnly] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["managerCustomers", branchId, search, marketingOnly],
    queryFn: () =>
      getManagerCustomers(branchId, {
        search: search || undefined,
        marketingOnly
      }),
    enabled: !!branchId
  })

  const { data: orderHistory } = useQuery({
    queryKey: ["managerCustomerOrders", branchId, selectedPhone],
    queryFn: () => getManagerCustomerOrders(selectedPhone!, branchId),
    enabled: !!selectedPhone && !!branchId
  })

  const automationMutation = useMutation({
    mutationFn: () => runManagerAutomation(branchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["managerCustomers", branchId] })
    }
  })

  const customers = data?.customers ?? []
  const stats = data?.stats

  const handleExport = async () => {
    const result = await exportManagerCustomers(branchId, marketingOnly)
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = result.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!branchId) return <p>No branch selected.</p>
  if (isLoading) return <p>Loading customers…</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Customers</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => refetch()}>Refresh</button>
          {can("customers_export") && (
            <button onClick={() => void handleExport()}>Export CSV</button>
          )}
          {can("customers_automation") && (
            <button
              onClick={() => automationMutation.mutate()}
              disabled={automationMutation.isPending}
            >
              {automationMutation.isPending ? "Running…" : "Run win-back & birthday"}
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <Stat label="Total customers" value={stats.total} />
          <Stat label="Marketing opt-in" value={stats.marketingOptIn} />
          <Stat label="Repeat (3+ orders)" value={stats.repeatCustomers} />
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={marketingOnly}
            onChange={(e) => setMarketingOnly(e.target.checked)}
          />
          Marketing only
        </label>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {customers.length === 0 ? (
          <p style={{ color: "#666" }}>No customers yet for this branch.</p>
        ) : (
          customers.map((c: any) => (
            <div
              key={c.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 14,
                background: selectedPhone === c.phone ? "#f5f0ff" : "#fff",
                cursor: "pointer"
              }}
              onClick={() => setSelectedPhone(c.phone)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{c.name || "Guest"}</strong>
                <span>{c.orderCount} orders</span>
              </div>
              <p style={{ margin: "6px 0 0", color: "#444" }}>{c.phone}</p>
              {c.email && <p style={{ margin: 0, color: "#666" }}>{c.email}</p>}
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>
                Channel: {c.preferredChannel ?? "—"}
                {c.birthday && ` · Birthday: ${String(c.birthday).slice(0, 10)}`}
                {c.lastOrderAt &&
                  ` · Last order: ${new Date(c.lastOrderAt).toLocaleDateString()}`}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedPhone && orderHistory?.orders && (
        <div style={{ marginTop: 24 }}>
          <h3>Order history — {selectedPhone}</h3>
          <ul style={{ paddingLeft: 20 }}>
            {orderHistory.orders.map((o: any) => (
              <li key={o.id} style={{ marginBottom: 8 }}>
                #{o.id.slice(0, 8)} · €{(o.orderTotal ?? 0).toFixed(2)} · {o.status} ·{" "}
                {new Date(o.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        padding: "12px 16px",
        minWidth: 140
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
