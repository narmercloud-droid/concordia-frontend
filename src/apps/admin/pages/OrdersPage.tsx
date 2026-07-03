import React, { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteManagerOrder, getManagerOrders, type ManagerOrder, type ManagerOrderFilters } from "@/api/manager"
import AdminOrderDetail from "@/apps/admin/components/AdminOrderDetail"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { useDocumentVisible } from "@/hooks/useDocumentVisible"
import { formatCurrency } from "@/utils/format"
import "./OrdersPage.css"

const PAGE_SIZE = 50

type CustomerTypeFilter = ManagerOrderFilters["customerType"] | ""
type PaymentMethodFilter = "" | "cash" | "card" | "paypal" | "klarna" | "sepa"

function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function formatPaymentMethod(method?: string | null) {
  if (!method) return "—"
  const value = method.toUpperCase()
  if (value === "COD" || value === "CASH") return "Cash"
  if (value === "CARD") return "Card"
  if (value === "PAYPAL") return "PayPal"
  if (value === "KLARNA") return "Klarna"
  if (value === "SEPA") return "SEPA"
  if (value === "STRIPE") return "Stripe"
  return method
}

function customerLabel(order: ManagerOrder) {
  return order.isGuest ? "Guest" : "Registered"
}

export default function OrdersPage() {
  const { branchId, branchName } = useAdminBranch()
  const admin = useAdminAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "admin"
  const queryClient = useQueryClient()
  const tabVisible = useDocumentVisible()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [customerType, setCustomerType] = useState<CustomerTypeFilter>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodFilter>("")
  const [offset, setOffset] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [accumulatedOrders, setAccumulatedOrders] = useState<ManagerOrder[]>([])

  const hasFilters = Boolean(search || customerType || paymentMethod)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setOffset(0)
      setExpandedId(null)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setOffset(0)
    setExpandedId(null)
  }, [customerType, paymentMethod])

  const queryFilters = useMemo(
    () => ({
      search: search || undefined,
      customerType: customerType || undefined,
      paymentMethod: paymentMethod || undefined,
      limit: PAGE_SIZE,
      offset
    }),
    [search, customerType, paymentMethod, offset]
  )

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["managerOrders", branchId, queryFilters],
    queryFn: () => getManagerOrders(branchId, queryFilters),
    enabled: !!branchId,
    staleTime: 10_000,
    retry: 1,
    refetchInterval: tabVisible && !hasFilters ? 15_000 : false
  })

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteManagerOrder(orderId, branchId),
    onSuccess: (_result, orderId) => {
      setExpandedId(null)
      setAccumulatedOrders((prev) => prev.filter((o) => o.id !== orderId))
      void queryClient.invalidateQueries({ queryKey: ["managerOrders", branchId] })
      void queryClient.invalidateQueries({ queryKey: ["managerCustomers", branchId] })
      void queryClient.invalidateQueries({ queryKey: ["managerDashboard", branchId] })
    }
  })

  const handleDeleteOrder = (order: ManagerOrder) => {
    const label = order.customerName ?? order.customerPhone ?? order.id.slice(0, 8)
    const confirmed = window.confirm(
      `Delete order #${shortOrderId(order.id)} (${label}) permanently?\n\nCustomer stats and revenue will be updated. This cannot be undone.`
    )
    if (!confirmed) return
    deleteMutation.mutate(order.id)
  }

  useEffect(() => {
    if (!data) return
    const orders = data.orders ?? []
    if (offset === 0) {
      setAccumulatedOrders(orders)
      return
    }
    setAccumulatedOrders((prev) => {
      const seen = new Set(prev.map((o) => o.id))
      const next = [...prev]
      for (const order of orders) {
        if (!seen.has(order.id)) next.push(order)
      }
      return next
    })
  }, [data, offset])

  const total = data?.total ?? 0
  const hasMore = accumulatedOrders.length < total

  const clearFilters = () => {
    setSearchInput("")
    setSearch("")
    setCustomerType("")
    setPaymentMethod("")
    setOffset(0)
    setExpandedId(null)
  }

  if (!branchId) return <p>No branch selected.</p>

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <div>
          <h2>Orders</h2>
          <p className="orders-page__lead">
            Filter and search past orders for {branchName ?? branchId} by customer type, payment
            method, name, address, or phone number.
          </p>
        </div>
        <div className="orders-page__toolbar">
          <input
            className="orders-page__search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, address, phone, order number…"
            aria-label="Search orders"
          />
          <select
            className="orders-page__filter"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerTypeFilter)}
            aria-label="Filter by customer type"
          >
            <option value="">All customers</option>
            <option value="guest">Guest orders</option>
            <option value="registered">Registered customers</option>
          </select>
          <select
            className="orders-page__filter"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodFilter)}
            aria-label="Filter by payment method"
          >
            <option value="">All payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="paypal">PayPal</option>
            <option value="klarna">Klarna</option>
            <option value="sepa">SEPA</option>
          </select>
          {hasFilters ? (
            <button type="button" className="orders-page__clear" onClick={clearFilters}>
              Clear filters
            </button>
          ) : null}
          <button type="button" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <p className="orders-page__meta">
        {hasFilters
          ? `${total} matching order${total === 1 ? "" : "s"}`
          : `Showing ${accumulatedOrders.length} of ${total} recent orders`}
      </p>

      {isError && offset === 0 ? (
        <p style={{ color: "crimson" }}>
          Could not load orders
          {error instanceof Error && error.message ? `: ${error.message}` : ""}. Try Refresh.
        </p>
      ) : isLoading && offset === 0 ? (
        <p>Loading orders…</p>
      ) : accumulatedOrders.length === 0 ? (
        <p className="orders-page__meta">
          {hasFilters ? "No orders match your filters." : "No orders yet."}
        </p>
      ) : (
        <div className="orders-page__list">
          {accumulatedOrders.map((order) => {
            const expanded = expandedId === order.id
            const address = [order.deliveryAddress, order.postalCode].filter(Boolean).join(", ")

            return (
              <article
                key={order.id}
                className={
                  order.status === "pending"
                    ? "orders-page__card orders-page__card--pending"
                    : "orders-page__card"
                }
              >
                <button
                  type="button"
                  className="orders-page__summary"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  <div className="orders-page__summary-top">
                    <strong className="orders-page__order-id">#{shortOrderId(order.id)}</strong>
                    <div className="orders-page__badges">
                      <span className="orders-page__badge">{customerLabel(order)}</span>
                      <span className="orders-page__badge orders-page__badge--muted">
                        {formatPaymentMethod(order.paymentMethod)}
                      </span>
                      <span className="orders-page__status">{order.status}</span>
                    </div>
                  </div>
                  <p className="orders-page__customer">
                    {order.customerName ?? "Guest"}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                  {address ? <p className="orders-page__address">{address}</p> : null}
                  <p className="orders-page__meta-line">
                    {order.fulfillmentType ?? "order"} · {formatCurrency(Number(order.orderTotal ?? 0))}
                    {order.scheduledFor
                      ? ` · Scheduled ${new Date(order.scheduledFor).toLocaleString()}`
                      : ` · ${new Date(order.createdAt).toLocaleString()}`}
                  </p>
                  <p className="orders-page__meta-line" style={{ color: "#888" }}>
                    {expanded ? "Hide details" : "Show full order details"}
                  </p>
                </button>
                {expanded ? (
                  <AdminOrderDetail
                    order={order}
                    canDelete={isSuperAdmin}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === order.id}
                    onDelete={() => handleDeleteOrder(order)}
                  />
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          className="orders-page__load-more"
          disabled={isFetching}
          onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
        >
          {isFetching ? "Loading…" : `Load more (${accumulatedOrders.length} of ${total})`}
        </button>
      ) : null}
    </div>
  )
}
