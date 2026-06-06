import React from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function AdminForm({ fields, values, setValues, onSubmit }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map((f: any) => (
        <Input
          key={f.key}
          placeholder={f.label}
          value={values[f.key] || ""}
          onChange={(e: any) => setValues({ ...values, [f.key]: e.target.value })}
        />
      ))}

      <Button onClick={onSubmit}>Save</Button>
    </div>
  )
}
