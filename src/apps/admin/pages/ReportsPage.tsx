import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBranches } from "@/api/customer"
import { downloadRevenueReportPdf, getRevenueReport } from "@/api/reports"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { formatCurrency } from "@/utils/format"

function todayBerlinYmd() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())
}

function firstDayOfMonthYmd() {
  const today = todayBerlinYmd()
  return `${today.slice(0, 8)}01`
}

export default function ReportsPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "admin"
  const [branchId, setBranchId] = useState(admin?.branchId ?? "concordia-kempen")
  const [from, setFrom] = useState(firstDayOfMonthYmd)
  const [to, setTo] = useState(todayBerlinYmd)
  const [pdfLoading, setPdfLoading] = useState(false)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: isSuperAdmin
  })

  const reportQuery = useQuery({
    queryKey: ["revenueReport", branchId, from, to],
    queryFn: () => getRevenueReport({ branchId, from, to }),
    enabled: Boolean(branchId && from && to)
  })

  const report = reportQuery.data

  const paymentRows = useMemo(() => report?.paymentBreakdown ?? [], [report])

  const handlePdf = async () => {
    setPdfLoading(true)
    try {
      await downloadRevenueReportPdf({ branchId, from, to })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div>
      <h1>Revenue reports</h1>
      <p style={{ color: "#666", maxWidth: 720 }}>
        Umsatzübersicht für Buchhaltung und Finanzamt. Barzahlungen bei Übergabe; Online-Zahlungen nur
        mit Status „paid“.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 20,
          marginBottom: 20
        }}
      >
        {isSuperAdmin && (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Branch
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              {(branches ?? []).map((b: { id: string; name?: string }) => (
                <option key={b.id} value={b.id}>
                  {b.name ?? b.id}
                </option>
              ))}
            </select>
          </label>
        )}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <button type="button" onClick={() => reportQuery.refetch()} disabled={reportQuery.isFetching}>
          {reportQuery.isFetching ? "Loading…" : "Refresh"}
        </button>
        <button
          type="button"
          onClick={() => void handlePdf()}
          disabled={pdfLoading || !report}
          style={{ fontWeight: 600 }}
        >
          {pdfLoading ? "Generating PDF…" : "Download PDF (Finanzamt)"}
        </button>
      </div>

      {reportQuery.isError && (
        <p style={{ color: "crimson" }}>Could not load report. Check date range and branch.</p>
      )}

      {report && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 24
            }}
          >
            {[
              ["Orders", report.orderCount],
              ["Cancelled", report.cancelledCount],
              ["Gross revenue", formatCurrency(report.grossRevenue)],
              ["Discounts", formatCurrency(report.discounts)],
              ["Net revenue", formatCurrency(report.netRevenue)],
              ["Avg. order", formatCurrency(report.avgOrderValue)]
            ].map(([label, value]) => (
              <div
                key={String(label)}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 14
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>

          <h2>Payment methods</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: 8 }}>Method</th>
                <th style={{ padding: 8 }}>Orders</th>
                <th style={{ padding: 8 }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 8, color: "#64748b" }}>
                    No revenue in this period.
                  </td>
                </tr>
              ) : (
                paymentRows.map((row) => (
                  <tr key={row.method} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 8 }}>{row.method}</td>
                    <td style={{ padding: 8 }}>{row.count}</td>
                    <td style={{ padding: 8 }}>{formatCurrency(row.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h2>Customers</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>Guest orders</td>
                <td style={{ padding: 8 }}>{report.customerTypeBreakdown?.guest?.count ?? 0}</td>
                <td style={{ padding: 8 }}>
                  {formatCurrency(report.customerTypeBreakdown?.guest?.total ?? 0)}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>Registered customers</td>
                <td style={{ padding: 8 }}>
                  {report.customerTypeBreakdown?.registered?.count ?? 0}
                </td>
                <td style={{ padding: 8 }}>
                  {formatCurrency(report.customerTypeBreakdown?.registered?.total ?? 0)}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>First-time (branch)</td>
                <td style={{ padding: 8 }}>
                  {report.newReturningBreakdown?.newCustomers?.count ?? 0}
                </td>
                <td style={{ padding: 8 }}>
                  {formatCurrency(report.newReturningBreakdown?.newCustomers?.total ?? 0)}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>Returning (branch)</td>
                <td style={{ padding: 8 }}>
                  {report.newReturningBreakdown?.returningCustomers?.count ?? 0}
                </td>
                <td style={{ padding: 8 }}>
                  {formatCurrency(report.newReturningBreakdown?.returningCustomers?.total ?? 0)}
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 13, color: "#64748b", maxWidth: 720 }}>{report.legalNote}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>
            {report.company.name} · USt-IdNr. {report.company.vatId} · {report.periodLabel}
          </p>
        </>
      )}
    </div>
  )
}
