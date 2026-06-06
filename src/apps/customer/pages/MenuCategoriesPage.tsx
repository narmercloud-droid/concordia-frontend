import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/api/menu"
import CategoryList from "../components/menu/CategoryList.js"

export default function MenuCategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: getCategories
  })

  if (isLoading) return <div>Loading categories...</div>

  return <CategoryList categories={data?.data || []} />
}
