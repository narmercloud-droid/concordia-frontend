import React from "react"

export default function Button({ children, ...props }: any) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 16px",
        background: "#111",
        color: "white",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  )
}
