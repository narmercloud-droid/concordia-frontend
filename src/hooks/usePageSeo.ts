import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useParams } from "react-router-dom"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { applyPageSeo, seoForPath } from "@/lib/seo"

/** Updates title, description, canonical and Open Graph tags for the current route. */
export function usePageSeo() {
  const { pathname } = useLocation()
  const { branchId } = useParams<{ branchId?: string }>()
  const { data: branches } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branch = branches?.find((b: { id: string }) => b.id === branchId)

  useEffect(() => {
    applyPageSeo(seoForPath(pathname, branch))
  }, [pathname, branch?.id, branch?.name, branch?.city])
}
