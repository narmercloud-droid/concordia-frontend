import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  exportManagerCustomers,
  getManagerCustomerOrders,
  getManagerCustomers,
  type ManagerBranchCustomer,
  runManagerAutomation
} from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import { formatCurrency } from "@/utils/format"
import "./CustomersPage.css"

export default function CustomersPage() {
  const { branchId, branchName } = useAdminBranch()
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
  const selectedCustomer = customers.find((c) => c.phone === selectedPhone) ?? null

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
    <div className="customers-page">
      <div className="customers-page__header">
        <div>
          <h2>Customers</h2>
          <p className="customers-page__lead">
            Branch database for {branchName ?? branchId}. Each branch keeps its own customer list.
          </p>
        </div>
        <div className="customers-page__actions">
          <button type="button" onClick={() => refetch()}>
            Refresh
          </button>
          {can("customers_export") && (
            <button type="button" onClick={() => void handleExport()}>
              Export CSV
            </button>
          )}
          {can("customers_automation") && (
            <button
              type="button"
              onClick={() => automationMutation.mutate()}
              disabled={automationMutation.isPending}
            >
              {automationMutation.isPending ? "Running…" : "Run win-back & birthday"}
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="customers-page__stats">
          <Stat label="Customers" value={String(stats.total)} />
          <Stat label="Total orders" value={String(stats.totalOrders)} />
          <Stat label="Total spent" value={formatCurrency(stats.totalSpent)} />
          <Stat label="Saved via offers" value={formatCurrency(stats.totalSaved)} />
          <Stat label="Marketing opt-in" value={String(stats.marketingOptIn)} />
          <Stat label="Repeat (3+ orders)" value={String(stats.repeatCustomers)} />
        </div>
      )}

      <div className="customers-page__filters">
        <input
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="customers-page__search"
        />
        <label className="customers-page__checkbox">
          <input
            type="checkbox"
            checked={marketingOnly}
            onChange={(e) => setMarketingOnly(e.target.checked)}
          />
          Marketing only
        </label>
      </div>

      {customers.length === 0 ? (
        <p className="customers-page__empty">No customers yet for this branch.</p>
      ) : (
        <div className="customers-page__table-wrap">
          <table className="customers-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Saved</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  selected={selectedPhone === customer.phone}
                  onSelect={() =>
                    setSelectedPhone((current) =>
                      current === customer.phone ? null : customer.phone
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && orderHistory?.orders && (
        <div className="customers-page__history">
          <h3>
            Order history — {selectedCustomer.name || "Guest"} ({selectedCustomer.phone})
          </h3>
          <p className="customers-page__history-summary">
            {selectedCustomer.orderCount} orders · spent{" "}
            {formatCurrency(selectedCustomer.totalSpent)} · saved{" "}
            {formatCurrency(selectedCustomer.totalSaved)} with offers
          </p>
          <ul className="customers-page__history-list">
            {orderHistory.orders.map((order: {
              id: string
              orderTotal?: number
              discount?: number
              giftCardAmount?: number | null
              status: string
              createdAt: string
            }) => {
              const saved =
                Number(order.discount ?? 0) + Number(order.giftCardAmount ?? 0)
              return (
                <li key={order.id}>
                  <strong>#{order.id.slice(0, 8)}</strong>
                  <span>{formatCurrency(Number(order.orderTotal ?? 0))}</span>
                  {saved > 0 ? (
                    <span className="customers-page__saved">
                      saved {formatCurrency(saved)}
                    </span>
                  ) : null}
                  <span>{order.status}</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function CustomerRow({
  customer,
  selected,
  onSelect
}: {
  customer: ManagerBranchCustomer
  selected: boolean
  onSelect: () => void
}) {
  return (
    <tr
      className={selected ? "customers-page__row customers-page__row--selected" : "customers-page__row"}
      onClick={onSelect}
    >
      <td>{customer.name || "Guest"}</td>
      <td>{customer.phone}</td>
      <td>{customer.email || "—"}</td>
      <td>{customer.orderCount}</td>
      <td>{formatCurrency(customer.totalSpent)}</td>
      <td>{formatCurrency(customer.totalSaved)}</td>
      <td>
        {customer.lastOrderAt
          ? new Date(customer.lastOrderAt).toLocaleDateString()
          : "—"}
      </td>
    </tr>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="customers-page__stat">
      <div className="customers-page__stat-label">{label}</div>
      <div className="customers-page__stat-value">{value}</div>
    </div>
  )
}
