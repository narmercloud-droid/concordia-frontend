import { getItemDetails } from "@/api/customer"
import queryClient from "@/lib/queryClient"
import { readItemDetailsCache } from "@/lib/itemDetailsCache"
import { resolveAppLanguage } from "@/i18n/languages"

const MAX_CONCURRENT = 3
let inFlight = 0
const queue: Array<() => void> = []

function menuLang(lang: string) {
  return resolveAppLanguage(lang.split("-")[0])
}

function runNext() {
  if (inFlight >= MAX_CONCURRENT || !queue.length) return
  const job = queue.shift()
  job?.()
}

function schedulePrefetch(job: () => Promise<void>) {
  return new Promise<void>((resolve) => {
    const run = () => {
      inFlight += 1
      void job()
        .catch(() => undefined)
        .finally(() => {
          inFlight -= 1
          runNext()
          resolve()
        })
    }
    if (inFlight < MAX_CONCURRENT) run()
    else queue.push(run)
  })
}

/** Warm item options before the modal opens (visible cards, hover, bestsellers). */
export function prefetchItemDetails(branchId: string, itemId: number, lang: string) {
  if (!branchId || !itemId) return
  const resolvedLang = menuLang(lang)

  const cached = readItemDetailsCache(branchId, itemId, resolvedLang)
  if (cached) {
    queryClient.setQueryData(["itemDetails", branchId, itemId, lang], cached)
    return
  }

  const state = queryClient.getQueryState(["itemDetails", branchId, itemId, lang])
  if (state?.fetchStatus === "fetching" || (state?.data && state.dataUpdatedAt > Date.now() - 60_000)) {
    return
  }

  void schedulePrefetch(() =>
    queryClient.prefetchQuery({
      queryKey: ["itemDetails", branchId, itemId, lang],
      queryFn: () => getItemDetails(branchId, String(itemId)),
      staleTime: 5 * 60_000
    })
  )
}

export function prefetchItemDetailsBatch(
  branchId: string,
  itemIds: number[],
  lang: string,
  limit = 8
) {
  const unique = [...new Set(itemIds.filter(Boolean))].slice(0, limit)
  for (const itemId of unique) {
    prefetchItemDetails(branchId, itemId, lang)
  }
}
