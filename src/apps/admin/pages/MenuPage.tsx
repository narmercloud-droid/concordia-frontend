import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createManagerCategory,
  createManagerMenuItem,
  deleteManagerCategory,
  deleteManagerMenuItem,
  getManagerMenu,
  updateManagerCategory,
  updateManagerMenuItem
} from "@/api/manager"
import MenuItemEditor from "@/apps/admin/components/MenuItemEditor"
import ExtraPresetsPanel from "@/apps/admin/components/ExtraPresetsPanel"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"
import { dishImageForItem } from "@/lib/foodImagery"
import { invalidateCustomerWebsiteCaches } from "@/lib/invalidateCustomerCaches"

export default function MenuPage() {
  const { branchId } = useAdminBranch()
  const { can } = useAdminPermissions()
  const canView = can("menu_view")
  const canEditPrices = can("menu_edit_prices")
  const canEditAvailability = can("menu_edit_availability")
  const canEditStructure = can("menu_edit_structure")
  const readOnly = canView && !canEditPrices && !canEditAvailability && !canEditStructure
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addingItemForCategory, setAddingItemForCategory] = useState<number | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("8.5")
  const [editingItem, setEditingItem] = useState<{
    menuItemId: number
    branchMenuItemId: number
  } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["managerMenu", branchId],
    queryFn: () => getManagerMenu(branchId)
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["managerMenu", branchId] })
    invalidateCustomerWebsiteCaches(queryClient, branchId)
  }

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
    onSuccess: invalidate
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

  const handleAddCategory = async () => {
    if (!canEditStructure || !newCategoryName.trim()) return
    await createManagerCategory({ name: newCategoryName.trim() }, branchId)
    setNewCategoryName("")
    invalidate()
  }

  const handleAddItem = async (categoryId: number) => {
    if (!canEditStructure || !newItemName.trim()) return
    await createManagerMenuItem(
      {
        categoryId,
        name: newItemName.trim(),
        price: Number(newItemPrice) || 0,
        kitchen: "B"
      },
      branchId
    )
    setNewItemName("")
    setAddingItemForCategory(null)
    invalidate()
  }

  return (
    <div>
      <h2>Menu</h2>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Manage categories, items, variants and extras. Price and availability changes appear on the
        customer website immediately.
      </p>
      {readOnly && (
        <p style={{ color: "#b45309", background: "#fff8e1", padding: 12, borderRadius: 8 }}>
          View only — editing is disabled. The super admin must enable menu edit permissions for
          your account.
        </p>
      )}

      {canEditStructure && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <input
            placeholder="New category name…"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ padding: 8, minWidth: 200 }}
          />
          <button type="button" onClick={() => void handleAddCategory()}>
            + Add category
          </button>
        </div>
      )}

      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 12, padding: 8, width: "100%", maxWidth: 320 }}
      />

      {filtered.map((cat: any) => (
        <div key={cat.id} style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {canEditStructure ? (
              <input
                defaultValue={cat.name}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== cat.name) {
                    void updateManagerCategory(cat.id, { name: e.target.value.trim() }, branchId).then(
                      invalidate
                    )
                  }
                }}
                style={{ fontSize: 18, fontWeight: 600, padding: "4px 8px" }}
              />
            ) : (
              <h3 style={{ margin: 0 }}>{cat.name}</h3>
            )}
            {canEditStructure && (
              <>
                <button type="button" onClick={() => setAddingItemForCategory(cat.id)}>
                  + Add item
                </button>
                <button
                  type="button"
                  style={{ color: "#b00020" }}
                  onClick={() => {
                    if (window.confirm(`Delete category "${cat.name}"? (must be empty)`)) {
                      void deleteManagerCategory(cat.id, branchId).then(invalidate)
                    }
                  }}
                >
                  Delete category
                </button>
              </>
            )}
          </div>

          {addingItemForCategory === cat.id && canEditStructure && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{ padding: 8 }}
              />
              <input
                type="number"
                step="0.1"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                style={{ padding: 8, width: 80 }}
              />
              <button type="button" onClick={() => void handleAddItem(cat.id)}>
                Create
              </button>
              <button type="button" onClick={() => setAddingItemForCategory(null)}>
                Cancel
              </button>
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, width: 56 }}>Photo</th>
                <th style={{ textAlign: "left", padding: 8 }}>Item</th>
                <th style={{ textAlign: "left", padding: 8 }}>Kitchen</th>
                <th style={{ textAlign: "left", padding: 8 }}>Price (€)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Available</th>
                <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cat.items.map((item: any) => (
                <tr key={item.branchMenuItemId} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
                  <td style={{ padding: 8 }}>
                    <img
                      src={
                        resolveMenuImageUrl(item.imageUrl) ??
                        dishImageForItem(item.name, null, cat.name, item.description)
                      }
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #e5e5e5"
                      }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.kitchen === "A" ? "Pizza" : "Rest"}</td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={item.price}
                      disabled={!canEditPrices}
                      onBlur={(e) => {
                        if (!canEditPrices) return
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
                      disabled={!canEditAvailability}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: item.branchMenuItemId,
                          isAvailable: e.target.checked
                        })
                      }
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    {(canEditStructure || canEditPrices || canEditAvailability) && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            menuItemId: item.menuItemId,
                            branchMenuItemId: item.branchMenuItemId
                          })
                        }
                      >
                        Edit
                      </button>
                    )}
                    {canEditStructure && (
                      <button
                        type="button"
                        style={{ marginLeft: 8, color: "#b00020" }}
                        onClick={() => {
                          if (window.confirm(`Remove "${item.name}" from the menu?`)) {
                            void deleteManagerMenuItem(item.branchMenuItemId, branchId).then(invalidate)
                          }
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <ExtraPresetsPanel
        branchId={branchId}
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        canEdit={canEditStructure}
      />

      {editingItem && (
        <MenuItemEditor
          menuItemId={editingItem.menuItemId}
          branchMenuItemId={editingItem.branchMenuItemId}
          branchId={branchId}
          categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
          canEditStructure={canEditStructure}
          canEditPrices={canEditPrices}
          canEditAvailability={canEditAvailability}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}

function resolveMenuImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
  return `${base}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`
}
