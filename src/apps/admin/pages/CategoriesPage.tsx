import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCategories,
  createCategory,
  deleteCategory,
  reorderCategories
} from "@/api/categories"
import AdminTable from "../components/AdminTable.js"
import AdminForm from "../components/AdminForm.js"
import AdminModal from "../components/AdminModal.js"
import DragHandle from "../components/DragHandle.js"
import api from "@/api/client"

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ["categories"], queryFn: getCategories })

  const [localList, setLocalList] = useState<any[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  React.useEffect(() => {
    if (data?.data) setLocalList(data.data)
  }, [data])

  const reorderMutation = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => queryClient.invalidateQueries(["categories"])
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
      order: updated.map((c, i) => ({ id: c.id, order: i }))
    })
  }

  const [formValues, setFormValues] = useState({ name: "" })
  const [editValues, setEditValues] = useState({ id: "", name: "" })
  const [editOpen, setEditOpen] = useState(false)

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries(["categories"])
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries(["categories"])
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/categories/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"])
      setEditOpen(false)
    }
  })

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
    { key: "name", label: "Category" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <>
          <button
            onClick={() => {
              setEditValues(row)
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
          <h2>Categories</h2>
          <AdminTable columns={columns} data={localList} />
        </div>

        <div style={{ width: 300 }}>
          <h3>Create Category</h3>
          <AdminForm
            fields={[{ key: "name", label: "Category Name" }]}
            values={formValues}
            setValues={setFormValues}
            onSubmit={() => createMutation.mutate(formValues)}
          />
        </div>
      </div>

      <AdminModal open={editOpen} onClose={() => setEditOpen(false)}>
        <h3>Edit Category</h3>
        <AdminForm
          fields={[{ key: "name", label: "Category Name" }]}
          values={editValues}
          setValues={setEditValues}
          onSubmit={() => updateMutation.mutate(editValues)}
        />
      </AdminModal>
    </>
  )
}
