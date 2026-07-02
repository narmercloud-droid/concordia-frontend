import React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ItemOptionsForm from "@/apps/customer/components/ItemOptionsForm"

export default function ItemDetailsPage() {
  const { branchId, itemId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const editCartKey = new URLSearchParams(location.search).get("edit")

  if (!branchId || !itemId) return null

  return (
    <div className="customer-page">
      {editCartKey && (
        <p className="customer-hint" style={{ marginBottom: 12 }}>
          {t("cart.editingItem")}
        </p>
      )}
      <ItemOptionsForm
        branchId={branchId}
        itemId={Number(itemId)}
        editCartKey={editCartKey}
        onAdded={() => navigate("/customer/cart")}
      />
    </div>
  )
}
