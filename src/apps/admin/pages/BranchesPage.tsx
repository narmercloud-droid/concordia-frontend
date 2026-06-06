import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBranches, createBranch, deleteBranch } from "@/api/branches"
import AdminTable from "../components/AdminTable.js"
import AdminForm from "../components/AdminForm.js"

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ["branches"], queryFn: getBranches })

  const [formValues, setFormValues] = useState({ name: "", address: "" })

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => queryClient.invalidateQueries(["branches"])
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => queryClient.invalidateQueries(["branches"])
  })

  const columns = [
    { key: "name", label: "Name" },
    { key: "address", label: "Address" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button onClick={() => deleteMutation.mutate(row.id)}>Delete</button>
      )
    }
  ]

  return (
    <div style={{ display: "flex", gap: 40 }}>
      <div style={{ flex: 1 }}>
        <h2>Branches</h2>
        <AdminTable columns={columns} data={data?.data || []} />
      </div>

      <div style={{ width: 300 }}>
        <h3>Create Branch</h3>
        <AdminForm
          fields={[
            { key: "name", label: "Branch Name" },
            { key: "address", label: "Address" }
          ]}
          values={formValues}
          setValues={setFormValues}
          onSubmit={() => createMutation.mutate(formValues)}
        />
      </div>
    </div>
  )
}
