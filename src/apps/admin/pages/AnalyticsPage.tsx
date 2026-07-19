import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getSalesAnalytics,
  getOrderVolumeAnalytics,
  getCategoryPerformance,
  getBranchPerformance,
  getPeakHours,
  getTopItems,
  getOrderLocationAnalytics
} from "@/api/analytics"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import OrderDensityMap from "@/apps/admin/components/OrderDensityMap"

import { Line, Bar, Pie } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

function ChartCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const { branchId } = useAdminBranch()
  const [mapDays, setMapDays] = useState(90)

  const salesQuery = useQuery({
    queryKey: ["salesAnalytics", branchId],
    queryFn: () => getSalesAnalytics(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const volumeQuery = useQuery({
    queryKey: ["orderVolume", branchId],
    queryFn: () => getOrderVolumeAnalytics(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const categoriesQuery = useQuery({
    queryKey: ["categoryPerformance", branchId],
    queryFn: () => getCategoryPerformance(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const branchesQuery = useQuery({
    queryKey: ["branchPerformance", branchId],
    queryFn: () => getBranchPerformance(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const peakQuery = useQuery({
    queryKey: ["peakHours", branchId],
    queryFn: () => getPeakHours(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const topItemsQuery = useQuery({
    queryKey: ["topItems", branchId],
    queryFn: () => getTopItems(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const locationsQuery = useQuery({
    queryKey: ["orderLocations", branchId, mapDays],
    queryFn: () => getOrderLocationAnalytics(branchId, mapDays),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const queries = [
    salesQuery,
    volumeQuery,
    categoriesQuery,
    branchesQuery,
    peakQuery,
    topItemsQuery
  ]

  const failedQueries = queries.filter((query) => query.isError)
  const isInitialLoad = queries.every((query) => query.isLoading)

  if (!branchId) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p>No branch selected.</p>
      </div>
    )
  }

  if (isInitialLoad) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p>Loading analytics…</p>
      </div>
    )
  }

  if (failedQueries.length === queries.length) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p style={{ color: "crimson" }}>Failed to load analytics. Try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Analytics Dashboard</h2>
      {failedQueries.length > 0 ? (
        <p style={{ color: "#b45309", marginBottom: 16 }}>
          Some charts could not be loaded. Showing available data.
        </p>
      ) : null}

      {locationsQuery.isLoading ? (
        <div className="order-density-map" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ color: "#64748b", margin: 0 }}>Loading order location map…</p>
        </div>
      ) : locationsQuery.isError ? (
        <div className="order-density-map" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ color: "#b45309", margin: 0 }}>
            Could not load the order location map.
          </p>
        </div>
      ) : locationsQuery.data ? (
        <OrderDensityMap
          data={locationsQuery.data}
          days={mapDays}
          onDaysChange={setMapDays}
        />
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <ChartCard title="Sales Over Time">
          {salesQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : salesQuery.data?.labels?.length ? (
            <Line
              data={{
                labels: salesQuery.data.labels,
                datasets: [
                  {
                    label: "Sales (€)",
                    data: salesQuery.data.values,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.1)"
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No sales data for this period.</p>
          )}
        </ChartCard>

        <ChartCard title="Order Volume">
          {volumeQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : volumeQuery.data?.labels?.length ? (
            <Bar
              data={{
                labels: volumeQuery.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: volumeQuery.data.values,
                    backgroundColor: "orange"
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No order volume data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Category Performance">
          {categoriesQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : categoriesQuery.data?.labels?.length ? (
            <Pie
              data={{
                labels: categoriesQuery.data.labels,
                datasets: [
                  {
                    data: categoriesQuery.data.values,
                    backgroundColor: ["red", "green", "blue", "purple", "orange", "teal", "gold", "gray"]
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No category data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Branch Performance">
          {branchesQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : branchesQuery.data?.labels?.length ? (
            <Bar
              data={{
                labels: branchesQuery.data.labels,
                datasets: [
                  {
                    label: "Sales (€)",
                    data: branchesQuery.data.values,
                    backgroundColor: "teal"
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No branch comparison data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Peak Hours">
          {peakQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : peakQuery.data?.labels?.length ? (
            <Line
              data={{
                labels: peakQuery.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: peakQuery.data.values,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.1)"
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No peak-hour data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Top Items">
          {topItemsQuery.isLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : topItemsQuery.data?.labels?.length ? (
            <Bar
              data={{
                labels: topItemsQuery.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: topItemsQuery.data.values,
                    backgroundColor: "gold"
                  }
                ]
              }}
            />
          ) : (
            <p style={{ color: "#64748b" }}>No top items yet.</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
