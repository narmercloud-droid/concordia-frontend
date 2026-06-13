import React, { useMemo } from "react"

import { useTranslation } from "react-i18next"

import { useQuery } from "@tanstack/react-query"

import { getBranchBestsellers, getBranchMenu } from "@/api/customer"

import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

import { categoryForItem, pickFeatured, type FeaturedMenuCategory } from "@/lib/featuredMenu"
import { bestsellersQueryOptions, menuQueryOptionsFor } from "@/lib/customerQueryOptions"

import { dishImageForName } from "@/lib/foodImagery"

import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"

import { formatCurrency } from "@/utils/format"

type Props = {
  branchId?: string | null
}

export default function HomeFeaturedMenu({ branchId }: Props) {
  const { t, i18n } = useTranslation()
  const activeBranch = branchId ?? KEMPEN_BRANCH_ID

  const { data } = useQuery({
    queryKey: ["branchMenu", activeBranch, i18n.language],
    queryFn: () => getBranchMenu(activeBranch),
    ...menuQueryOptionsFor(activeBranch, i18n.language)
  })

  const menuReady = !!data?.categories?.length

  const { data: bestsellersData } = useQuery({
    queryKey: ["branchBestsellers", activeBranch, i18n.language],
    queryFn: () => getBranchBestsellers(activeBranch),
    enabled: menuReady,
    ...bestsellersQueryOptions
  })

  const categories: FeaturedMenuCategory[] = data?.categories ?? []

  const featured = useMemo(
    () => pickFeatured(categories, 6, { salesItemIds: bestsellersData?.itemIds }),
    [categories, bestsellersData?.itemIds]
  )

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
