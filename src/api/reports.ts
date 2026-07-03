import api from "./client.js"

export type RevenueReport = {
  company: {
    name: string
    owner: string
    address: string
    vatId: string
    email: string
  }
  branchId: string
  branchName: string
  timezone: string
  from: string
  to: string
  periodLabel: string
  generatedAt: string
  orderCount: number
  cancelledCount: number
  grossRevenue: number
  deliveryFees: number
  discounts: number
  netRevenue: number
  avgOrderValue: number
  delivery: { count: number; revenue: number }
  pickup: { count: number; revenue: number }
  paymentBreakdown: Array<{ method: string; count: number; total: number }>
  customerTypeBreakdown: {
    guest: { count: number; total: number }
    registered: { count: number; total: number }
  }
  newReturningBreakdown: {
    newCustomers: { count: number; total: number }
    returningCustomers: { count: number; total: number }
    unknown: { count: number; total: number }
  }
  legalNote: string
}

export function getRevenueReport(params: {
  branchId?: string
  from: string
  to: string
}) {
  return api.get<RevenueReport>("/api/admin/reports/revenue", { params })
}

export async function downloadRevenueReportPdf(params: {
  branchId?: string
  from: string
  to: string
}) {
  const response = await api.get("/api/admin/reports/revenue/pdf", {
    params,
    responseType: "blob"
  })
  const blob = response.data as Blob
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `umsatzbericht-${params.from}${params.to !== params.from ? `-${params.to}` : ""}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
