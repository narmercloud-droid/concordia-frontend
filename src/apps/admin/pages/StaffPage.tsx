import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from "@/api/staff"
import { getBranches } from "@/api/customer"
import AdminTable from "../components/AdminTable.js"
import AdminModal from "../components/AdminModal.js"
import AdminForm from "../components/AdminForm.js"

export default function StaffPage() {
  const queryClient = useQueryClient()

  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: getStaff })
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
    branchId: ""
  })

  const [editOpen, setEditOpen] = useState(false)
  const [editValues, setEditValues] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    branchId: ""
  })

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] })
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateStaff(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"])
      setEditOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] })
  })

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "branchName", label: "Branch" },
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
          <h2>Staff</h2>
          <AdminTable columns={columns} data={staff?.data || []} />
        </div>

        <div style={{ width: 300 }}>
          <h3>Create Staff</h3>

          <input
            placeholder="Name"
            value={formValues.name}
            onChange={(e) =>
              setFormValues({ ...formValues, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            value={formValues.email}
            onChange={(e) =>
              setFormValues({ ...formValues, email: e.target.value })
            }
          />

          <select
            value={formValues.role}
            onChange={(e) =>
              setFormValues({ ...formValues, role: e.target.value })
            }
          >
            <option value="">Select Role</option>
            <option value="admin">Super admin (owner)</option>
            <option value="manager">Branch manager</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={formValues.password}
            onChange={(e) =>
              setFormValues({ ...formValues, password: e.target.value })
            }
          />

          <select
            value={formValues.branchId}
            onChange={(e) =>
              setFormValues({ ...formValues, branchId: e.target.value })
            }
          >
            <option value="">Select Branch</option>
            {(branches ?? []).map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button onClick={() => createMutation.mutate(formValues)}>
            Save
          </button>
        </div>
      </div>

      <AdminModal open={editOpen} onClose={() => setEditOpen(false)}>
        <h3>Edit Staff</h3>

        <input
          placeholder="Name"
          value={editValues.name}
          onChange={(e) =>
            setEditValues({ ...editValues, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={editValues.email}
          onChange={(e) =>
            setEditValues({ ...editValues, email: e.target.value })
          }
        />

        <select
          value={editValues.role}
          onChange={(e) =>
            setEditValues({ ...editValues, role: e.target.value })
          }
        >
          <option value="">Select Role</option>
          <option value="admin">Super admin (owner)</option>
          <option value="manager">Branch manager</option>
        </select>

        <select
          value={editValues.branchId}
          onChange={(e) =>
            setEditValues({ ...editValues, branchId: e.target.value })
          }
        >
          <option value="">Select Branch</option>
          {(branches ?? []).map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button onClick={() => updateMutation.mutate(editValues)}>
          Save
        </button>
      </AdminModal>
    </>
  )
}
