import React from "react"

export default function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    pending: "#999",
    confirmed: "#007bff",
    preparing: "#ff9800",
    ready: "#4caf50",
    delivering: "#673ab7",
    completed: "#2e7d32"
  }

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: colors[status] || "#555",
        color: "white",
        fontSize: 12
      }}
    >
      {status.toUpperCase()}
    </span>
  )
}
