import React from "react"
import { useItemOptions } from "@/apps/customer/hooks/useItemOptions"
import ItemOptionsFields from "./ItemOptionsFields"
import ItemOptionsFooter from "./ItemOptionsFooter"
type Props = {
  branchId: string
  itemId: number
  editCartKey?: string | null
  onAdded?: () => void
}

export default function ItemOptionsForm({ branchId, itemId, editCartKey, onAdded }: Props) {
  const options = useItemOptions(branchId, itemId, editCartKey)

  if (options.isLoading) {
    return <p className="customer-loading">{options.t("item.loading")}</p>
  }

  if (options.isError || !options.item) {
    return (
      <div className="customer-page">
        <p className="customer-hint" style={{ color: "#b45309" }}>
          {options.t("item.loadError")}
        </p>
        <button type="button" className="customer-btn" onClick={() => void options.refetchItem()}>
          {options.t("common.retry")}
        </button>
      </div>
    )
  }

  const handleAdd = () => {
    options.addToCart(onAdded)
  }

  return (
    <div className="item-options item-options--page">
      <ItemOptionsFields options={options} />
      <ItemOptionsFooter options={options} onAdd={handleAdd} editMode={options.isEditMode} />
    </div>
  )
}
