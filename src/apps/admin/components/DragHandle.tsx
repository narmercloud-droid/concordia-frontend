import React from "react"

export default function DragHandle() {
  return (
    <span
      style={{
        cursor: "grab",
        padding: "0 6px",
        fontSize: 18,
        userSelect: "none"
      }}
    >
      ⋮⋮
    </span>
  )
}
