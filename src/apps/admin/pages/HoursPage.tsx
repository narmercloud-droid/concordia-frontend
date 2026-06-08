import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getManagerBranch,
  getManagerHours,
  updateManagerBranchStatus,
  updateManagerHours
} from "@/api/manager"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import Button from "@/components/ui/Button"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type HourRow = { dayOfWeek: number; openTime: string; closeTime: string }

export default function HoursPage() {
  const { branchId, branchName } = useAdminBranch()
  const { can, isSuperAdmin } = useAdminPermissions()
  const canEdit = can("hours_edit")
  const readOnly = can("hours_view") && !canEdit
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<HourRow[]>([])
  const [saved, setSaved] = useState(false)

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["managerBranch", branchId],
    queryFn: () => getManagerBranch(branchId),
    enabled: !!branchId
  })

  const { data, isLoading: hoursLoading } = useQuery({
    queryKey: ["managerHours", branchId],
    queryFn: () => getManagerHours(branchId),
    enabled: !!branchId
  })

  const branchStatus = branch?.status === "coming_soon" ? "coming_soon" : "live"

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

  const statusMutation = useMutation({
    mutationFn: (status: "live" | "coming_soon") =>
      updateManagerBranchStatus(status, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerBranch", branchId] })
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })

  const updateRow = (index: number, field: "openTime" | "closeTime", value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  if (branchLoading || hoursLoading) return <p>Loading hours...</p>

  return (
    <div>
      <h2>Opening hours</h2>
      <p style={{ color: "#666" }}>
        These hours control when {branchName ?? "this branch"} appears open on the website and
        which time slots customers can choose.
      </p>

      {isSuperAdmin && (
        <div
          style={{
            marginTop: 20,
            marginBottom: 24,
            padding: 16,
            background: "#f7f4ff",
            border: "1px solid #e8e0f5",
            borderRadius: 8,
            maxWidth: 640
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Branch visibility (super admin)</h3>
          <p style={{ margin: "0 0 12px", color: "#666", fontSize: 14 }}>
            <strong>Active</strong> — customers can order (opening hours still apply).{" "}
            <strong>Inactive</strong> — branch shows as coming soon and cannot accept orders.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={statusMutation.isPending || branchStatus === "live"}
              onClick={() => statusMutation.mutate("live")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #1b7340",
                background: branchStatus === "live" ? "#1b7340" : "white",
                color: branchStatus === "live" ? "white" : "#1b7340",
                cursor: statusMutation.isPending || branchStatus === "live" ? "default" : "pointer"
              }}
            >
              Active — order now
            </button>
            <button
              type="button"
              disabled={statusMutation.isPending || branchStatus === "coming_soon"}
              onClick={() => statusMutation.mutate("coming_soon")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #e65100",
                background: branchStatus === "coming_soon" ? "#e65100" : "white",
                color: branchStatus === "coming_soon" ? "white" : "#e65100",
                cursor:
                  statusMutation.isPending || branchStatus === "coming_soon" ? "default" : "pointer"
              }}
            >
              Inactive — coming soon
            </button>
          </div>
          {statusMutation.isError && (
            <p style={{ color: "#b00020", marginTop: 12, marginBottom: 0, fontSize: 14 }}>
              {(statusMutation.error as any)?.response?.data?.error?.message ??
                (statusMutation.error as any)?.response?.data?.message ??
                "Could not update branch status. Try again."}
            </p>
          )}
        </div>
      )}

      {readOnly && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled until the super admin enables hours edit permission.
        </p>
      )}

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
