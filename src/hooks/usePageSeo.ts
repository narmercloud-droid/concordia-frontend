import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useParams } from "react-router-dom"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { restaurantJsonLd } from "@/lib/branchSeo"
import { applyPageSeo, seoForPath } from "@/lib/seo"

/** Updates title, description, canonical, Open Graph and Restaurant JSON-LD. */
export function usePageSeo() {
  const { pathname } = useLocation()
  const { branchId } = useParams<{ branchId?: string }>()
  const { data: branches } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branch = branches?.find((b: { id: string }) => b.id === branchId)

  useEffect(() => {
    const seo = seoForPath(pathname, branch)
    const match = pathname.match(/^\/branch\/([^/]+)/)
    const id = match?.[1]
    const jsonLd =
      id && !pathname.includes("/checkout") && !pathname.includes("/item/")
        ? restaurantJsonLd(id)
        : null
    applyPageSeo(seo, jsonLd)
  }, [pathname, branch?.id, branch?.name, branch?.city])
}
