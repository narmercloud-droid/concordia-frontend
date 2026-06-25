import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getManagerOrders, type ManagerOrder } from "@/api/manager"
import AdminOrderDetail from "@/apps/admin/components/AdminOrderDetail"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useDocumentVisible } from "@/hooks/useDocumentVisible"
import { formatCurrency } from "@/utils/format"
import "./OrdersPage.css"

const PAGE_SIZE = 50

function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export default function OrdersPage() {
  const { branchId, branchName } = useAdminBranch()
  const tabVisible = useDocumentVisible()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [offset, setOffset] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [accumulatedOrders, setAccumulatedOrders] = useState<ManagerOrder[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setOffset(0)
      setExpandedId(null)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["managerOrders", branchId, search, offset],
    queryFn: () =>
      getManagerOrders(branchId, {
        search: search || undefined,
        limit: PAGE_SIZE,
        offset
      }),
    enabled: !!branchId,
    staleTime: 10_000,
    refetchInterval: tabVisible && !search ? 15_000 : false
  })

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

  if (!branchId) return <p>No branch selected.</p>

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <div>
          <h2>Orders</h2>
          <p className="orders-page__lead">
            Search past orders for {branchName ?? branchId} by customer name, street, phone, or
            order number. Click an order to see the full details.
          </p>
        </div>
        <div className="orders-page__toolbar">
          <input
            className="orders-page__search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, street, phone, order number…"
            aria-label="Search orders"
          />
          <button type="button" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <p className="orders-page__meta">
        {search
          ? `${total} matching order${total === 1 ? "" : "s"}`
          : `Showing ${accumulatedOrders.length} of ${total} recent orders`}
      </p>

      {isLoading && offset === 0 ? (
        <p>Loading orders…</p>
      ) : accumulatedOrders.length === 0 ? (
        <p className="orders-page__meta">
          {search ? "No orders match your search." : "No orders yet."}
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
                    <span className="orders-page__status">{order.status}</span>
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
                {expanded ? <AdminOrderDetail order={order} /> : null}
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
