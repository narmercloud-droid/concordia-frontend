import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getManagerReviews } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
function stars(rating: number | null | undefined) {
  if (rating == null) return "—"
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return "★".repeat(full) + "☆".repeat(5 - full)
}

function formatRating(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—"
  return value.toFixed(1)
}

function isLowReview(row: { foodRating: number; deliveryRating: number | null }) {
  return row.foodRating <= 3 || (row.deliveryRating != null && row.deliveryRating <= 3)
}

export default function ReviewsPage() {
  const { branchId } = useAdminBranch()
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [lowRatingsOnly, setLowRatingsOnly] = useState(false)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["managerReviews", branchId, fromDate, toDate, lowRatingsOnly],
    queryFn: () =>
      getManagerReviews(branchId, {
        from: fromDate || undefined,
        to: toDate || undefined,
        lowRatingsOnly
      }),
    enabled: !!branchId
  })

  const reviews = data?.reviews ?? []
  const summary = data?.summary

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        label: "Date",
        render: (row: { createdAt: string }) =>
          new Date(row.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
      },
      {
        key: "customerName",
        label: "Customer",
        render: (row: { customerName: string; customerEmail: string | null }) => (
          <div>
            <div>{row.customerName}</div>
            {row.customerEmail && (
              <div style={{ fontSize: 12, color: "#666" }}>{row.customerEmail}</div>
            )}
          </div>
        )
      },
      {
        key: "foodRating",
        label: "Food",
        render: (row: { foodRating: number }) => (
          <span title={`${row.foodRating}/5`}>{stars(row.foodRating)}</span>
        )
      },
      {
        key: "deliveryRating",
        label: "Delivery",
        render: (row: { deliveryRating: number | null; order: { fulfillmentType: string | null } }) =>
          row.order.fulfillmentType === "delivery" ? (
            <span title={row.deliveryRating != null ? `${row.deliveryRating}/5` : undefined}>
              {stars(row.deliveryRating)}
            </span>
          ) : (
            <span style={{ color: "#999" }}>Pickup</span>
          )
      },
      {
        key: "comment",
        label: "Comment",
        render: (row: { comment: string | null }) =>
          row.comment ? (
            <span style={{ maxWidth: 360, display: "inline-block" }}>{row.comment}</span>
          ) : (
            <span style={{ color: "#999" }}>—</span>
          )
      },
      {
        key: "orderId",
        label: "Order",
        render: (row: { orderId: string }) => (
          <code style={{ fontSize: 12 }}>{row.orderId.slice(0, 8)}…</code>
        )
      }
    ],
    []
  )

  const tableData = reviews.map((review) => ({
    ...review,
    id: review.id,
    _low: isLowReview(review)
  }))

  if (!branchId) return <p>No branch selected.</p>
  if (isLoading) return <p>Loading customer feedback…</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2>Customer feedback</h2>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <p style={{ color: "#666", marginTop: 4 }}>
        Ratings and comments from website orders — use this to improve food quality and delivery.
      </p>

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginTop: 20
          }}
        >
          <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.reviewCount}</div>
            <div>Total reviews</div>
          </div>
          <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {formatRating(summary.averageFoodRating)}
            </div>
            <div>Avg. food</div>
          </div>
          <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {formatRating(summary.averageDeliveryRating)}
            </div>
            <div>Avg. delivery ({summary.deliveryReviewCount})</div>
          </div>
          <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {formatRating(summary.averageOverallRating)}
            </div>
            <div>Overall average</div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "end",
          marginTop: 24,
          padding: 16,
          background: "#fafafa",
          borderRadius: 8,
          border: "1px solid #eee"
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
          From
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
          To
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, paddingBottom: 6 }}>
          <input
            type="checkbox"
            checked={lowRatingsOnly}
            onChange={(e) => setLowRatingsOnly(e.target.checked)}
          />
          Low ratings only (3★ or less)
        </label>
        {(fromDate || toDate || lowRatingsOnly) && (
          <button
            type="button"
            onClick={() => {
              setFromDate("")
              setToDate("")
              setLowRatingsOnly(false)
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        {reviews.length === 0 ? (
          <p style={{ color: "#666" }}>No reviews match your filters yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr
                  key={row.id}
                  style={row._low ? { background: "#fff5f5" } : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: 8, borderBottom: "1px solid #eee", verticalAlign: "top" }}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
