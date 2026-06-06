import React from "react"

export default function Input(props: any) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        width: "100%"
      }}
    />
  )
}
