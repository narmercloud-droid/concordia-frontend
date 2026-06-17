import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getManagerHours, updateManagerHours } from "@/api/manager"
import Button from "@/components/ui/Button"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type HourRow = { dayOfWeek: number; openTime: string; closeTime: string }

type Props = {
  branchId: string | null | undefined
  canEdit?: boolean
  embedded?: boolean
}

export default function BranchHoursEditor({
  branchId,
  canEdit = true,
  embedded = false
}: Props) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<HourRow[]>([])
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["managerHours", branchId],
    queryFn: () => getManagerHours(branchId),
    enabled: !!branchId
  })

  useEffect(() => {
    const hours = data?.data?.data ?? []
    if (hours.length > 0) {
      setRows(
        hours.map((h: HourRow) => ({
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
  }, [data, branchId])

  const saveMutation = useMutation({
    mutationFn: () => updateManagerHours(rows, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHours", branchId] })
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  })

  const updateRow = (index: number, field: "openTime" | "closeTime", value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  if (!branchId) {
    return <p style={{ color: "#666" }}>Select a branch to edit opening hours.</p>
  }

  if (isLoading) return <p>Loading opening hours…</p>

  return (
    <div style={embedded ? { marginTop: 8 } : undefined}>
      {!embedded && (
        <>
          <h2>Opening hours</h2>
          <p style={{ color: "#666" }}>
            These hours control when this branch appears open on the website and which time slots
            customers can choose.
          </p>
        </>
      )}

      {embedded && (
        <p style={{ color: "#666", fontSize: 14, marginBottom: 12 }}>
          Weekly schedule — controls website open/closed status and customer time slots.
        </p>
      )}

      {!canEdit && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled until the super admin enables hours edit permission.
        </p>
      )}

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
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
                  disabled={!canEdit}
                  onChange={(e) => updateRow(index, "openTime", e.target.value)}
                />
              </td>
              <td style={{ padding: 8 }}>
                <input
                  type="time"
                  value={row.closeTime}
                  disabled={!canEdit}
                  onChange={(e) => updateRow(index, "closeTime", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!canEdit || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving…" : "Save opening hours"}
        </Button>
        {saved && <span style={{ color: "#2e7d32" }}>Saved!</span>}
      </div>
    </div>
  )
}
