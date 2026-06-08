import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getCategories } from "@/api/menu"
import CategoryList from "../components/menu/CategoryList.js"

export default function MenuCategoriesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: getCategories
  })

  if (isLoading) return <div>{t("menu.loading")}</div>

  return <CategoryList categories={data?.data || []} />
}
