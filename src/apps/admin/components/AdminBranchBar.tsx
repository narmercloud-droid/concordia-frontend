import React from "react"
import { useAdminBranch } from "@/hooks/useAdminBranch"

export default function AdminBranchBar() {
  const { isSuperAdmin, branchId, branchName, branches, setSelectedBranchId } =
    useAdminBranch()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        padding: "12px 16px",
        background: "#f7f4ff",
        border: "1px solid #e8e0f5",
        borderRadius: 8
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Active branch</div>
        <strong>{branchName ?? branchId}</strong>
      </div>
      {isSuperAdmin && branches.length > 0 && (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#555" }}>Switch branch</span>
          <select
            value={branchId ?? ""}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" }}
          >
            {branches.map((b: { id: string; name?: string }) => (
              <option key={b.id} value={b.id}>
                {b.name ?? b.id}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
