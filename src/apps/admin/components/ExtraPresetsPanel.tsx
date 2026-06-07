import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addManagerPresetOption,
  createManagerExtraPreset,
  deleteManagerExtraPreset,
  deleteManagerPresetOption,
  getManagerExtraPresets,
  importManagerDefaultPresets,
  updateManagerExtraPreset,
  updateManagerPresetOption
} from "@/api/manager"

type Category = { id: number; name: string }

type Props = {
  branchId: string
  categories: Category[]
  canEdit: boolean
}

export default function ExtraPresetsPanel({ branchId, categories, canEdit }: Props) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newPresetName, setNewPresetName] = useState("")

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ["managerExtraPresets", branchId],
    queryFn: () => getManagerExtraPresets(branchId)
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["managerExtraPresets", branchId] })
    queryClient.invalidateQueries({ queryKey: ["managerMenu", branchId] })
  }

  const importMutation = useMutation({
    mutationFn: () => importManagerDefaultPresets(branchId),
    onSuccess: invalidate
  })

  if (isLoading) return <p>Loading extra presets…</p>

  return (
    <div style={{ marginTop: 32, padding: 20, background: "#f8f9fa", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Shared extra / topping groups</h3>
      <p style={{ color: "#666", maxWidth: 720, marginBottom: 16 }}>
        Define topping groups once, then assign them to categories. Every item in those
        categories automatically gets these extras on the customer website — no need to add
        each topping to each item individually.
      </p>

      {canEdit && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <input
            placeholder="New group name (e.g. Gemüse)"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            style={{ padding: 8, minWidth: 200 }}
          />
          <button
            type="button"
            onClick={() => {
              if (!newPresetName.trim()) return
              void createManagerExtraPreset({ name: newPresetName.trim() }, branchId).then(() => {
                setNewPresetName("")
                invalidate()
              })
            }}
          >
            + Add group
          </button>
          {presets.length === 0 && (
            <button
              type="button"
              disabled={importMutation.isPending}
              onClick={() => importMutation.mutate()}
            >
              {importMutation.isPending ? "Importing…" : "Import Kempen defaults"}
            </button>
          )}
        </div>
      )}

      {presets.length === 0 && (
        <p style={{ color: "#888" }}>
          No shared groups yet. Create one or import the Kempen defaults (Gemüse, Fleisch, etc.).
        </p>
      )}

      {presets.map((preset: any) => (
        <div
          key={preset.id}
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: 14,
            marginBottom: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            {canEdit ? (
              <input
                defaultValue={preset.name}
                onBlur={(e) => {
                  if (e.target.value.trim() !== preset.name) {
                    void updateManagerExtraPreset(preset.id, { name: e.target.value.trim() }, branchId).then(
                      invalidate
                    )
                  }
                }}
                style={{ fontWeight: 600, fontSize: 16, padding: "4px 8px", flex: 1 }}
              />
            ) : (
              <strong>{preset.name}</strong>
            )}
            <button type="button" onClick={() => setExpanded(expanded === preset.id ? null : preset.id)}>
              {expanded === preset.id ? "Collapse" : "Expand"}
            </button>
            {canEdit && (
              <button
                type="button"
                style={{ color: "#b00020" }}
                onClick={() => {
                  if (window.confirm(`Delete group "${preset.name}"?`)) {
                    void deleteManagerExtraPreset(preset.id, branchId).then(invalidate)
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 13, color: "#666" }}>Auto-apply to categories: </span>
            {categories.map((cat) => {
              const checked = (preset.categoryIds ?? []).includes(cat.id)
              return (
                <label key={cat.id} style={{ marginRight: 12, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const next = new Set<number>(preset.categoryIds ?? [])
                      if (e.target.checked) next.add(cat.id)
                      else next.delete(cat.id)
                      void updateManagerExtraPreset(
                        preset.id,
                        { categoryIds: Array.from(next) },
                        branchId
                      ).then(invalidate)
                    }}
                  />{" "}
                  {cat.name}
                </label>
              )
            })}
          </div>

          {expanded === preset.id && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
                {preset.options?.length ?? 0} toppings in this group
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {(preset.options ?? []).map((opt: any) => (
                  <li key={opt.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                      defaultValue={opt.name}
                      disabled={!canEdit}
                      onBlur={(e) =>
                        void updateManagerPresetOption(
                          opt.id,
                          { name: e.target.value },
                          branchId
                        ).then(invalidate)
                      }
                      style={{ flex: 1, padding: "4px 8px" }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={opt.price}
                      disabled={!canEdit}
                      onBlur={(e) =>
                        void updateManagerPresetOption(
                          opt.id,
                          { price: Number(e.target.value) },
                          branchId
                        ).then(invalidate)
                      }
                      style={{ width: 72, padding: "4px 8px" }}
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          void deleteManagerPresetOption(opt.id, branchId).then(invalidate)
                        }
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {canEdit && (
                <button
                  type="button"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    void addManagerPresetOption(preset.id, { name: "New topping", price: 1 }, branchId).then(
                      invalidate
                    )
                  }
                >
                  + Add topping
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
