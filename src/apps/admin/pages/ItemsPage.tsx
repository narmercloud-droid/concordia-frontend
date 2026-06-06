import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getItems,
  createItem,
  deleteItem,
  reorderItems,
  toggleItemAvailability
} from "@/api/items"
import { getCategories } from "@/api/categories"
import AdminTable from "../components/AdminTable.js"
import AdminModal from "../components/AdminModal.js"
import DragHandle from "../components/DragHandle.js"
import Button from "@/components/ui/Button"
import api from "@/api/client"

export default function ItemsPage() {
  const queryClient = useQueryClient()

  const { data: items } = useQuery({ queryKey: ["items"], queryFn: getItems })
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  })

  const [localList, setLocalList] = useState<any[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  React.useEffect(() => {
    if (items?.data) setLocalList(items.data)
  }, [items])

  const reorderMutation = useMutation({
    mutationFn: reorderItems,
    onSuccess: () => queryClient.invalidateQueries(["items"])
  })

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: any) => e.preventDefault()

  const handleDrop = (index: number) => {
    if (dragIndex === null) return

    const updated = [...localList]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)

    setLocalList(updated)
    setDragIndex(null)

    reorderMutation.mutate({
      order: updated.map((i, idx) => ({ id: i.id, order: idx }))
    })
  }

  const toggleMutation = useMutation({
    mutationFn: toggleItemAvailability,
    onSuccess: () => queryClient.invalidateQueries(["items"])
  })

  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    categoryId: "",
    image: null as any
  })

  const [editOpen, setEditOpen] = useState(false)
  const [editValues, setEditValues] = useState({
    id: "",
    name: "",
    price: "",
    categoryId: "",
    image: null as any,
    preview: ""
  })

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries(["items"])
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries(["items"])
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (k !== "preview") fd.append(k, v as any)
      })
      return api.put(`/admin/items/${data.id}`, fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["items"])
      setEditOpen(false)
    }
  })

  const handleCreate = () => {
    const fd = new FormData()
    Object.entries(formValues).forEach(([k, v]) => fd.append(k, v as any))
    createMutation.mutate(fd)
  }

  const columns = [
    {
      key: "drag",
      label: "",
      render: (_: any, index: number) => (
        <div
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        >
          <DragHandle />
        </div>
      )
    },
    { key: "name", label: "Name" },
    { key: "price", label: "Price" },
    { key: "categoryName", label: "Category" },
    {
      key: "available",
      label: "Available",
      render: (row: any) => (
        <button onClick={() => toggleMutation.mutate(row.id)}>
          {row.available ? "Yes" : "No"}
        </button>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <>
          <button
            onClick={() => {
              setEditValues({
                id: row.id,
                name: row.name,
                price: row.price,
                categoryId: row.categoryId,
                image: null,
                preview: row.imageUrl
              })
              setEditOpen(true)
            }}
          >
            Edit
          </button>
          <button onClick={() => deleteMutation.mutate(row.id)}>Delete</button>
        </>
      )
    }
  ]

  return (
    <>
      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ flex: 1 }}>
          <h2>Items</h2>
          <AdminTable columns={columns} data={localList} />
        </div>

        <div style={{ width: 300 }}>
          <h3>Create Item</h3>

          <input
            placeholder="Name"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          />

          <input
            placeholder="Price"
            value={formValues.price}
            onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
          />

          <select
            value={formValues.categoryId}
            onChange={(e) =>
              setFormValues({ ...formValues, categoryId: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories?.data?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            onChange={(e) =>
              setFormValues({ ...formValues, image: e.target.files?.[0] || null })
            }
          />

          <Button onClick={handleCreate}>Save</Button>
        </div>
      </div>

      <AdminModal open={editOpen} onClose={() => setEditOpen(false)}>
        <h3>Edit Item</h3>

        <input
          placeholder="Name"
          value={editValues.name}
          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
        />

        <input
          placeholder="Price"
          value={editValues.price}
          onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
        />

        <select
          value={editValues.categoryId}
          onChange={(e) =>
            setEditValues({ ...editValues, categoryId: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories?.data?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {editValues.preview && (
          <img
            src={editValues.preview}
            style={{ width: 120, height: 120, objectFit: "cover", marginBottom: 10 }}
          />
        )}

        <input
          type="file"
          onChange={(e) =>
            setEditValues({
              ...editValues,
              image: e.target.files?.[0] || null,
              preview: e.target.files?.[0]
                ? URL.createObjectURL(e.target.files[0])
                : editValues.preview
            })
          }
        />

        <Button onClick={() => updateMutation.mutate(editValues)}>Save</Button>
      </AdminModal>
    </>
  )
}
