import React from "react"
import { useItemOptions } from "@/apps/customer/hooks/useItemOptions"
import ItemOptionsFields from "./ItemOptionsFields"
import ItemOptionsFooter from "./ItemOptionsFooter"
type Props = {
  branchId: string
  itemId: number
  onAdded?: () => void
}

export default function ItemOptionsForm({ branchId, itemId, onAdded }: Props) {
  const options = useItemOptions(branchId, itemId)

  if (options.isLoading) {
    return <p className="customer-loading">{options.t("item.loading")}</p>
  }

  if (!options.item) {
    return <p className="customer-loading">{options.t("item.loading")}</p>
  }

  const handleAdd = () => {
    options.addToCart(onAdded)
  }

  return (
    <div className="item-options">
      <ItemOptionsFields options={options} />
      <ItemOptionsFooter options={options} onAdd={handleAdd} />
    </div>
  )
}
