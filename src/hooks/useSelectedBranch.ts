import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useCartStore } from "@/store/cartStore"
import { useBranchStore } from "@/store/branchStore"

/** Resolves the active branch: URL param → route → cart → saved preference. */
export function useSelectedBranch() {
  const [searchParams] = useSearchParams()
  const { branchId: routeBranchId } = useParams<{ branchId?: string }>()
  const cartBranchId = useCartStore((s) => s.items[0]?.branchId)
  const storedBranchId = useBranchStore((s) => s.selectedBranchId)
  const setSelectedBranchId = useBranchStore((s) => s.setSelectedBranchId)

  const queryBranchId = searchParams.get("branchId")?.trim() || null
  const resolved =
    queryBranchId ?? routeBranchId ?? cartBranchId ?? storedBranchId ?? null

  useEffect(() => {
    if (queryBranchId) setSelectedBranchId(queryBranchId)
    else if (routeBranchId) setSelectedBranchId(routeBranchId)
  }, [queryBranchId, routeBranchId, setSelectedBranchId])

  return {
    branchId: resolved,
    setBranchId: setSelectedBranchId
  }
}
