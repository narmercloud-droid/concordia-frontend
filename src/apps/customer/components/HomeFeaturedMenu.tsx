import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { getBranchMenu } from "@/api/customer"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import { dishImageForName } from "@/lib/foodImagery"
import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"
import { formatCurrency } from "@/utils/format"

type MenuItem = {
  id: number
  name: string
  price: number
  imageUrl?: string | null
}

type MenuCategory = {
  name: string
  items: MenuItem[]
}

type Props = {
  branchId?: string | null
}

function firstItem(categories: MenuCategory[], pattern: RegExp) {
  const cat = categories.find((c) => pattern.test(c.name))
  return cat?.items?.find((i) => i.price > 0) ?? null
}

function pickFeatured(categories: MenuCategory[], limit = 6) {
  const picks = [
    firstItem(categories, /pizzen/i) ?? firstItem(categories, /pizza/i),
    firstItem(categories, /pasta/i),
    firstItem(categories, /salat/i),
    firstItem(categories, /al forno/i),
    firstItem(categories, /schnitzel/i),
    firstItem(categories, /baguette/i)
  ].filter((item): item is MenuItem => item != null)

  const seen = new Set<number>()
  return picks.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  }).slice(0, limit)
}

function categoryForItem(categories: MenuCategory[], item: MenuItem) {
  return categories.find((c) => c.items.some((i) => i.id === item.id))?.name ?? ""
}

export default function HomeFeaturedMenu({ branchId }: Props) {
  const { t } = useTranslation()
  const activeBranch = branchId ?? KEMPEN_BRANCH_ID

  const { data, isLoading } = useQuery({
    queryKey: ["branchMenu", activeBranch, "featured"],
    queryFn: () => getBranchMenu(activeBranch)
  })

  const categories: MenuCategory[] = data?.categories ?? []

  const featured = useMemo(() => pickFeatured(categories), [data])

  if (isLoading) return null
  if (!featured.length) return null

  return (
    <section className="home-featured">
      <p className="home-section-label">{t("home.featuredLabel")}</p>
      <h2 className="home-section-title">{t("home.featuredTitle")}</h2>
      <div className="home-featured__track">
        {featured.map((item) => {
          const categoryName = categoryForItem(categories, item)
          return (
            <article key={item.id} className="home-featured__card">
              <button
                type="button"
                className="home-featured__card-hit"
                onClick={scrollToBranchChoice}
              >
                <div
                  className="home-featured__visual"
                  style={{
                    backgroundImage: `url(${dishImageForName(item.name, item.imageUrl, categoryName)})`
                  }}
                />
                <div className="home-featured__body">
                  <h3>{item.name}</h3>
                  <p className="home-featured__price">{formatCurrency(item.price)}</p>
                  <span className="home-featured__btn">{t("home.chooseBranchToOrder")}</span>
                </div>
              </button>
            </article>
          )
        })}
      </div>
      <button type="button" className="home-featured__menu-link" onClick={scrollToBranchChoice}>
        {t("home.featuredCta")}
      </button>
    </section>
  )
}
