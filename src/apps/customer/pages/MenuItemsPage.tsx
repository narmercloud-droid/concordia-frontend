import React from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getItemsByCategory } from "@/api/menu"
import MenuItemCard from "../components/menu/MenuItemCard.js"

export default function MenuItemsPage() {
  const { t } = useTranslation()
  const { categoryId } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["menu-items", categoryId],
    queryFn: () => getItemsByCategory(categoryId!)
  })

  if (isLoading) return <div>{t("menu.loading")}</div>

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {data?.data?.map((item: any) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
