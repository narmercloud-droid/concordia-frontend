import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  clearManagerMenuItemImage,
  createManagerAddOn,
  createManagerAddOnGroup,
  createManagerVariant,
  createManagerVariantGroup,
  deleteManagerAddOn,
  deleteManagerAddOnGroup,
  deleteManagerVariant,
  deleteManagerVariantGroup,
  getManagerMenuItemDetail,
  updateManagerAddOn,
  updateManagerAddOnGroup,
  updateManagerMenuItem,
  updateManagerMenuItemFull,
  updateManagerVariant,
  updateManagerVariantGroupFull,
  uploadManagerMenuItemImage
} from "@/api/manager"
import { dishImageForItem } from "@/lib/foodImagery"

type Category = { id: number; name: string }

type Props = {
  menuItemId: number
  branchMenuItemId: number
  branchId: string
  categories: Category[]
  canEditStructure: boolean
  canEditPrices: boolean
  canEditAvailability: boolean
  onClose: () => void
}

export default function MenuItemEditor({
  menuItemId,
  branchMenuItemId,
  branchId,
  categories,
  canEditStructure,
  canEditPrices,
  canEditAvailability,
  onClose
}: Props) {
  const canEditPriceField = canEditStructure || canEditPrices
  const canEditAvailabilityField = canEditStructure || canEditAvailability
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["managerMenuItem", branchId, menuItemId],
    queryFn: () => getManagerMenuItemDetail(menuItemId, branchId)
  })

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [kitchen, setKitchen] = useState("B")
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!data) return
    setName(data.name ?? "")
    setDescription(data.description ?? "")
    setPrice(String(data.price ?? 0))
    setKitchen(data.kitchen ?? "B")
    setCategoryId(data.categoryId ?? "")
    setSortOrder(String(data.sortOrder ?? 0))
    setIsAvailable(data.isAvailable !== false)
    setImageUrl(data.imageUrl ?? null)
    setImagePreview(null)
  }, [data])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["managerMenu", branchId] })
    queryClient.invalidateQueries({ queryKey: ["managerMenuItem", branchId, menuItemId] })
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateManagerMenuItemFull(
        branchMenuItemId,
        {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          kitchen,
          categoryId: categoryId === "" ? undefined : Number(categoryId),
          sortOrder: Number(sortOrder) || 0,
          isAvailable
        },
        branchId
      ),
    onSuccess: () => {
      invalidate()
      setError("")
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message ?? "Could not save item")
    }
  })

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => uploadManagerMenuItemImage(branchMenuItemId, file, branchId),
    onSuccess: (result: { imageUrl?: string | null }) => {
      setImageUrl(result?.imageUrl ?? null)
      setImagePreview(null)
      invalidate()
      setError("")
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message ?? "Could not upload photo")
    }
  })

  const clearImageMutation = useMutation({
    mutationFn: () => clearManagerMenuItemImage(branchMenuItemId, branchId),
    onSuccess: () => {
      setImageUrl(null)
      setImagePreview(null)
      invalidate()
      setError("")
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message ?? "Could not remove photo")
    }
  })

  const partialSaveMutation = useMutation({
    mutationFn: () =>
      updateManagerMenuItem(
        branchMenuItemId,
        {
          price: canEditPrices ? Number(price) : undefined,
          isAvailable: canEditAvailability ? isAvailable : undefined
        },
        branchId
      ),
    onSuccess: () => {
      invalidate()
      setError("")
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message ?? "Could not save item")
    }
  })

  const run = async (fn: () => Promise<unknown>) => {
    if (!canEditStructure) return
    try {
      await fn()
      invalidate()
      setError("")
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Action failed")
    }
  }

  if (isLoading || !data) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <p>Loading item…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Edit item</h3>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {error && <p style={{ color: "#b00020" }}>{error}</p>}

        <div style={gridStyle}>
          <label>
            Name
            <input
              value={name}
              disabled={!canEditStructure}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            Price (€)
            <input
              type="number"
              step="0.1"
              value={price}
              disabled={!canEditPriceField}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            Kitchen
            <select
              value={kitchen}
              disabled={!canEditStructure}
              onChange={(e) => setKitchen(e.target.value)}
              style={inputStyle}
            >
              <option value="B">Rest (Kitchen B)</option>
              <option value="A">Pizza (Kitchen A)</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={categoryId}
              disabled={!canEditStructure}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              style={inputStyle}
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort order
            <input
              type="number"
              value={sortOrder}
              disabled={!canEditStructure}
              onChange={(e) => setSortOrder(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
            <input
              type="checkbox"
              checked={isAvailable}
              disabled={!canEditAvailabilityField}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            Available on website
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          Description
          <textarea
            rows={2}
            value={description}
            disabled={!canEditStructure}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </label>

        <section style={{ marginTop: 16 }}>
          <h4 style={{ margin: "0 0 8px" }}>Item photo</h4>
          <p style={{ fontSize: 13, color: "#666", marginTop: 0 }}>
            Upload a real photo for this dish. It appears on the customer menu instead of the
            generic placeholder.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <img
              src={
                imagePreview ??
                resolveMenuImageUrl(imageUrl) ??
                dishImageForItem(name, null, "", description)
              }
              alt={name || "Menu item"}
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                background: "#f5f5f5"
              }}
            />
            {canEditStructure && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadImageMutation.isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setImagePreview(URL.createObjectURL(file))
                      uploadImageMutation.mutate(file)
                      e.target.value = ""
                    }}
                  />
                </label>
                {uploadImageMutation.isPending && (
                  <span style={{ fontSize: 13, color: "#666" }}>Uploading…</span>
                )}
                {imageUrl && (
                  <button
                    type="button"
                    disabled={clearImageMutation.isPending}
                    onClick={() => clearImageMutation.mutate()}
                  >
                    {clearImageMutation.isPending ? "Removing…" : "Remove photo"}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {canEditStructure && (
          <button
            type="button"
            style={{ marginTop: 12 }}
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : "Save item details"}
          </button>
        )}
        {!canEditStructure && (canEditPrices || canEditAvailability) && (
          <button
            type="button"
            style={{ marginTop: 12 }}
            disabled={partialSaveMutation.isPending}
            onClick={() => partialSaveMutation.mutate()}
          >
            {partialSaveMutation.isPending ? "Saving…" : "Save changes"}
          </button>
        )}

        <section style={{ marginTop: 24 }}>
          <div style={sectionHead}>
            <h4 style={{ margin: 0 }}>Variants (sizes, options)</h4>
            {canEditStructure && (
              <button
                type="button"
                onClick={() =>
                  void run(() =>
                    createManagerVariantGroup(
                      menuItemId,
                      { name: "New option group", required: true, maxSelect: 1, variants: [] },
                      branchId
                    )
                  )
                }
              >
                + Add group
              </button>
            )}
          </div>
          {data.variantGroups?.map((group: any) => (
            <div key={group.id} style={groupBox}>
              <div style={sectionHead}>
                <input
                  defaultValue={group.name}
                  disabled={!canEditStructure}
                  onBlur={(e) =>
                    void run(() =>
                      updateManagerVariantGroupFull(group.id, { name: e.target.value }, branchId)
                    )
                  }
                  style={inputStyle}
                />
                {canEditStructure && (
                  <button
                    type="button"
                    onClick={() => void run(() => deleteManagerVariantGroup(group.id, branchId))}
                  >
                    Delete group
                  </button>
                )}
              </div>
              <label style={{ fontSize: 13 }}>
                <input
                  type="checkbox"
                  defaultChecked={group.required}
                  disabled={!canEditStructure}
                  onChange={(e) =>
                    void run(() =>
                      updateManagerVariantGroupFull(group.id, { required: e.target.checked }, branchId)
                    )
                  }
                />{" "}
                Required
              </label>
              <label style={{ fontSize: 13, marginLeft: 12 }}>
                <input
                  type="checkbox"
                  defaultChecked={group.includedChoice}
                  disabled={!canEditStructure}
                  onChange={(e) =>
                    void run(() =>
                      updateManagerVariantGroupFull(
                        group.id,
                        { includedChoice: e.target.checked },
                        branchId
                      )
                    )
                  }
                />{" "}
                Included choice (free)
              </label>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
                {group.variants?.map((v: any) => (
                  <li key={v.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                      defaultValue={v.name}
                      disabled={!canEditStructure}
                      onBlur={(e) =>
                        void run(() => updateManagerVariant(v.id, { name: e.target.value }, branchId))
                      }
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={v.price}
                      disabled={!canEditStructure}
                      onBlur={(e) =>
                        void run(() =>
                          updateManagerVariant(v.id, { price: Number(e.target.value) }, branchId)
                        )
                      }
                      style={{ ...inputStyle, width: 72 }}
                    />
                    {canEditStructure && (
                      <button type="button" onClick={() => void run(() => deleteManagerVariant(v.id, branchId))}>
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {canEditStructure && (
                <button
                  type="button"
                  onClick={() =>
                    void run(() =>
                      createManagerVariant(group.id, { name: "New option", price: 0 }, branchId)
                    )
                  }
                >
                  + Add variant
                </button>
              )}
            </div>
          ))}
        </section>

        {(data.presetAddOnGroups?.length ?? 0) > 0 && (
          <section style={{ marginTop: 24 }}>
            <h4 style={{ margin: "0 0 8px" }}>Shared extras (from category)</h4>
            <p style={{ fontSize: 13, color: "#666", marginTop: 0 }}>
              These come from shared topping groups on the Menu page. Edit them there — they
              apply automatically to all items in linked categories.
            </p>
            {data.presetAddOnGroups.map((group: any) => (
              <div key={group.id} style={{ ...groupBox, background: "#f8f9fa" }}>
                <strong>{group.name}</strong>
                <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>(shared)</span>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
                  {group.addOns?.map((a: any) => (
                    <li key={a.id}>
                      {a.name} (+€{a.price})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <section style={{ marginTop: 24 }}>
          <div style={sectionHead}>
            <h4 style={{ margin: 0 }}>Item-specific extras</h4>
            {canEditStructure && (
              <button
                type="button"
                onClick={() =>
                  void run(() =>
                    createManagerAddOnGroup(menuItemId, { name: "New extras", addOns: [] }, branchId)
                  )
                }
              >
                + Add group
              </button>
            )}
          </div>
          {data.addOnGroups?.map((group: any) => (
            <div key={group.id} style={groupBox}>
              <div style={sectionHead}>
                <input
                  defaultValue={group.name}
                  disabled={!canEditStructure}
                  onBlur={(e) =>
                    void run(() => updateManagerAddOnGroup(group.id, { name: e.target.value }, branchId))
                  }
                  style={inputStyle}
                />
                {canEditStructure && (
                  <button
                    type="button"
                    onClick={() => void run(() => deleteManagerAddOnGroup(group.id, branchId))}
                  >
                    Delete group
                  </button>
                )}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
                {group.addOns?.map((a: any) => (
                  <li key={a.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                      defaultValue={a.name}
                      disabled={!canEditStructure}
                      onBlur={(e) =>
                        void run(() => updateManagerAddOn(a.id, { name: e.target.value }, branchId))
                      }
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={a.price}
                      disabled={!canEditStructure}
                      onBlur={(e) =>
                        void run(() =>
                          updateManagerAddOn(a.id, { price: Number(e.target.value) }, branchId)
                        )
                      }
                      style={{ ...inputStyle, width: 72 }}
                    />
                    {canEditStructure && (
                      <button type="button" onClick={() => void run(() => deleteManagerAddOn(a.id, branchId))}>
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {canEditStructure && (
                <button
                  type="button"
                  onClick={() =>
                    void run(() => createManagerAddOn(group.id, { name: "New extra", price: 0 }, branchId))
                  }
                >
                  + Add extra
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "40px 16px",
  overflow: "auto"
}

const panelStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  width: "100%",
  maxWidth: 720,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 16
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "6px 8px"
}

const sectionHead: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}

const groupBox: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  padding: 12,
  marginTop: 10
}

function resolveMenuImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
  return `${base}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`
}
