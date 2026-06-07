import React from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getItem } from "@/api/menu"
import Button from "@/components/ui/Button"
import { formatCurrency } from "@/utils/format"
import { useCartStore } from "@/context/cartStore"

export default function MenuItemDetailsPage() {
  const { t } = useTranslation()
  const { itemId } = useParams()

  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading } = useQuery({
    queryKey: ["menu-item", itemId],
    queryFn: () => getItem(itemId!)
  })

  if (isLoading) return <div>{t("item.loading")}</div>

  const item = data?.data

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <img
        src={item.image}
        alt={item.name}
        style={{ width: "100%", borderRadius: 8 }}
      />

      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <strong>{formatCurrency(item.price)}</strong>

      <Button onClick={() => addItem(item)}>{t("item.addToCart")}</Button>
    </div>
  )
}
