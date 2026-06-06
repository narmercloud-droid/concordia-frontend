import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getSalesAnalytics,
  getOrderVolumeAnalytics,
  getCategoryPerformance,
  getBranchPerformance,
  getPeakHours,
  getTopItems
} from "@/api/analytics"

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

export default function AnalyticsPage() {
  const salesQuery = useQuery({
    queryKey: ["salesAnalytics"],
    queryFn: getSalesAnalytics
  })

  const volumeQuery = useQuery({
    queryKey: ["orderVolume"],
    queryFn: getOrderVolumeAnalytics
  })

  const categoriesQuery = useQuery({
    queryKey: ["categoryPerformance"],
    queryFn: getCategoryPerformance
  })

  const branchesQuery = useQuery({
    queryKey: ["branchPerformance"],
    queryFn: getBranchPerformance
  })

  const peakQuery = useQuery({
    queryKey: ["peakHours"],
    queryFn: getPeakHours
  })

  const topItemsQuery = useQuery({
    queryKey: ["topItems"],
    queryFn: getTopItems
  })

  const isLoading = [
    salesQuery,
    volumeQuery,
    categoriesQuery,
    branchesQuery,
    peakQuery,
    topItemsQuery
  ].some((query) => query.isLoading)

  const isError = [
    salesQuery,
    volumeQuery,
    categoriesQuery,
    branchesQuery,
    peakQuery,
    topItemsQuery
  ].some((query) => query.isError)

  const hasAnyData = [
    salesQuery,
    volumeQuery,
    categoriesQuery,
    branchesQuery,
    peakQuery,
    topItemsQuery
  ].some((query) => !!query.data?.data)

  if (isLoading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p>Loading analytics…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p>Failed to load analytics.</p>
      </div>
    )
  }

  if (!hasAnyData) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Analytics Dashboard</h2>
        <p>No analytics available.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Analytics Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <h3>Sales Over Time</h3>
          {salesQuery.data?.data && (
            <Line
              data={{
                labels: salesQuery.data.data.labels,
                datasets: [
                  {
                    label: "Sales (€)",
                    data: salesQuery.data.data.values,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.1)"
                  }
                ]
              }}
            />
          )}
        </div>

        <div>
          <h3>Order Volume</h3>
          {volumeQuery.data?.data && (
            <Bar
              data={{
                labels: volumeQuery.data.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: volumeQuery.data.data.values,
                    backgroundColor: "orange"
                  }
                ]
              }}
            />
          )}
        </div>

        <div>
          <h3>Category Performance</h3>
          {categoriesQuery.data?.data && (
            <Pie
              data={{
                labels: categoriesQuery.data.data.labels,
                datasets: [
                  {
                    data: categoriesQuery.data.data.values,
                    backgroundColor: [
                      "red",
                      "green",
                      "blue",
                      "purple",
                      "orange"
                    ]
                  }
                ]
              }}
            />
          )}
        </div>

        <div>
          <h3>Branch Performance</h3>
          {branchesQuery.data?.data && (
            <Bar
              data={{
                labels: branchesQuery.data.data.labels,
                datasets: [
                  {
                    label: "Sales (€)",
                    data: branchesQuery.data.data.values,
                    backgroundColor: "teal"
                  }
                ]
              }}
            />
          )}
        </div>

        <div>
          <h3>Peak Hours</h3>
          {peakQuery.data?.data && (
            <Line
              data={{
                labels: peakQuery.data.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: peakQuery.data.data.values,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.1)"
                  }
                ]
              }}
            />
          )}
        </div>

        <div>
          <h3>Top Items</h3>
          {topItemsQuery.data?.data && (
            <Bar
              data={{
                labels: topItemsQuery.data.data.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: topItemsQuery.data.data.values,
                    backgroundColor: "gold"
                  }
                ]
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
