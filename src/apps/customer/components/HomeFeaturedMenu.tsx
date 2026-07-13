import React, { useMemo, useRef } from "react"

import { useTranslation } from "react-i18next"

import { useQuery } from "@tanstack/react-query"

import { getBranchBestsellers, getBranchMenu } from "@/api/customer"

import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

import {
  categoryForItem,
  pickFeatured,
  type FeaturedMenuCategory,
  type FeaturedMenuItem
} from "@/lib/featuredMenu"
import { bestsellersQueryOptions, menuQueryOptionsFor } from "@/lib/customerQueryOptions"
import { getMenuLang } from "@/lib/menuLang"

import { dishImageForName } from "@/lib/foodImagery"

import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"

import { formatCurrency } from "@/utils/format"
import { useInView } from "@/hooks/useInView"

type Props = {
  branchId?: string | null
}

export default function HomeFeaturedMenu({ branchId }: Props) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef)
  const activeBranch = branchId ?? KEMPEN_BRANCH_ID
  const menuLang = getMenuLang()

  const { data: bestsellersData } = useQuery({
    queryKey: ["branchBestsellers", activeBranch, menuLang],
    queryFn: () => getBranchBestsellers(activeBranch),
    enabled: inView,
    ...bestsellersQueryOptions
  })

  const needsMenuFallback =
    inView &&
    (!bestsellersData?.hasSalesData || (bestsellersData.items?.length ?? 0) < 3)

  const menuOpts = menuQueryOptionsFor(activeBranch, menuLang)
  const { data: menuData } = useQuery({
    ...menuOpts,
    queryKey: ["branchMenu", activeBranch, menuLang],
    queryFn: () => getBranchMenu(activeBranch),
    enabled: needsMenuFallback
  })

  const categories: FeaturedMenuCategory[] = menuData?.categories ?? []

  const featured = useMemo(() => {
    if (bestsellersData?.hasSalesData && (bestsellersData.items?.length ?? 0) >= 3) {
      return (bestsellersData.items ?? []).slice(0, 6) as FeaturedMenuItem[]
    }
    if (categories.length) {
      return pickFeatured(categories, 6, { salesItemIds: bestsellersData?.itemIds })
    }
    return []
  }, [bestsellersData, categories])

  if (!inView) {
    return <section ref={sectionRef} className="home-featured home-featured--placeholder" aria-hidden />
  }

  if (!featured.length) return null

  return (
    <section ref={sectionRef} className="home-featured">
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
                    backgroundImage: `url(${dishImageForName(item.name, item.imageUrl, categoryName, item.description)})`
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
