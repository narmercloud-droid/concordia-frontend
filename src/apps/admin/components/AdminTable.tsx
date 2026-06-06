import React from "react"

export default function AdminTable({ columns, data }: any) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th
              key={col.key}
              style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row: any) => (
          <tr key={row.id}>
            {columns.map((col: any) => (
              <td key={col.key} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
