import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getManagerMenu, updateManagerMenuItem } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export default function MenuPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const branchId = admin?.branchId ?? undefined
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["managerMenu", branchId],
    queryFn: () => getManagerMenu(branchId)
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      price,
      isAvailable
    }: {
      id: number
      price?: number
      isAvailable?: boolean
    }) => updateManagerMenuItem(id, { price, isAvailable }, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["managerMenu", branchId] })
  })

  const categories = data?.data?.data ?? []

  if (isLoading) return <p>Loading menu...</p>

  const filtered = categories
    .map((cat: any) => ({
      ...cat,
      items: cat.items.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((cat: any) => cat.items.length > 0 || !search)

  return (
    <div>
      <h2>Menu</h2>
      <p style={{ color: "#666" }}>
        Toggle availability and edit prices. Changes appear on the customer website immediately.
      </p>

      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 12, padding: 8, width: "100%", maxWidth: 320 }}
      />

      {filtered.map((cat: any) => (
        <div key={cat.id} style={{ marginTop: 24 }}>
          <h3>{cat.name}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Item</th>
                <th style={{ textAlign: "left", padding: 8 }}>Kitchen</th>
                <th style={{ textAlign: "left", padding: 8 }}>Price (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Available</th>
              </tr>
            </thead>
            <tbody>
              {cat.items.map((item: any) => (
                <tr key={item.branchMenuItemId} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
                  <td style={{ padding: 8 }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.kitchen === "A" ? "Pizza" : "Rest"}</td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={item.price}
                      onBlur={(e) => {
                        const price = Number(e.target.value)
                        if (price !== item.price) {
                          updateMutation.mutate({ id: item.branchMenuItemId, price })
                        }
                      }}
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: item.branchMenuItemId,
                          isAvailable: e.target.checked
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
