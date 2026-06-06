import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getBranchMenu } from "@/api/customer"

export default function BranchMenuPage() {
  const { branchId } = useParams()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ["branchMenu", branchId],
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId
  })

  if (!data?.categories) return <p>Loading...</p>

  return (
    <div>
      <h2>Menu</h2>

      {data.categories.map((cat: any) => (
        <div key={cat.id} style={{ marginBottom: 20 }}>
          <h3>{cat.name}</h3>

          {cat.items.map((i: any) => (
            <div
              key={i.id}
              style={{
                padding: 12,
                border: "1px solid #ccc",
                marginBottom: 12
              }}
            >
              <h4>{i.name}</h4>
              <p>{i.price} €</p>
              <button
                onClick={() =>
                  navigate(`/customer/branch/${branchId}/item/${i.id}`)
                }
              >
                View
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
