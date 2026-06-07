import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import ItemOptionsForm from "@/apps/customer/components/ItemOptionsForm"

export default function ItemDetailsPage() {
  const { branchId, itemId } = useParams()
  const navigate = useNavigate()

  if (!branchId || !itemId) return null

  return (
    <div className="customer-page">
      <ItemOptionsForm
        branchId={branchId}
        itemId={Number(itemId)}
        onAdded={() => navigate("/customer/cart")}
      />
    </div>
  )
}
