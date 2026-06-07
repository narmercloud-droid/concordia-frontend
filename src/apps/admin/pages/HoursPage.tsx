import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getManagerHours, updateManagerHours } from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import Button from "@/components/ui/Button"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type HourRow = { dayOfWeek: number; openTime: string; closeTime: string }

export default function HoursPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const canEdit = can("hours_edit")
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<HourRow[]>([])
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["managerHours", branchId],
    queryFn: () => getManagerHours(branchId)
  })

  useEffect(() => {
    const hours = data?.data?.data ?? []
    if (hours.length > 0) {
      setRows(
        hours.map((h: any) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime
        }))
      )
    } else {
      setRows(
        DAY_NAMES.map((_, i) => ({
          dayOfWeek: i,
          openTime: "11:00",
          closeTime: "22:00"
        }))
      )
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => updateManagerHours(rows, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHours", branchId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  const updateRow = (index: number, field: "openTime" | "closeTime", value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  if (isLoading) return <p>Loading hours...</p>

  return (
    <div>
      <h2>Opening hours</h2>
      <p style={{ color: "#666" }}>These hours control scheduled order time slots.</p>

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Day</th>
            <th style={{ textAlign: "left", padding: 8 }}>Open</th>
            <th style={{ textAlign: "left", padding: 8 }}>Close</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.dayOfWeek}>
              <td style={{ padding: 8 }}>{DAY_NAMES[row.dayOfWeek]}</td>
              <td style={{ padding: 8 }}>
                <input
                  type="time"
                  value={row.openTime}
                  onChange={(e) => updateRow(index, "openTime", e.target.value)}
                />
              </td>
              <td style={{ padding: 8 }}>
                <input
                  type="time"
                  value={row.closeTime}
                  onChange={(e) => updateRow(index, "closeTime", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!canEdit || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save hours"}
        </Button>
        {saved && <span style={{ color: "#2e7d32" }}>Saved!</span>}
      </div>
    </div>
  )
}
