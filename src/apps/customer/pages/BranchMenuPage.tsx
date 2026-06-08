import React, { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchBestsellers, getBranchMenu } from "@/api/customer"
import { bestsellersQueryOptions, menuQueryOptions } from "@/lib/customerQueryOptions"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import BranchOwnerWelcome from "@/apps/customer/components/BranchOwnerWelcome"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import { getBranchOwnerBranding } from "@/lib/branchBranding"
import {
  BEST_SELLERS_SECTION_ID,
  categoryForItem,
  pickFeatured
} from "@/lib/featuredMenu"
import { dishImageForName } from "@/lib/foodImagery"
import { formatCurrency } from "@/utils/format"
import "./BranchMenuPage.css"

type MenuItem = {
  id: number
  itemNumber?: string | null
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
}

type MenuCategory = {
  id: string | number
  name: string
  description?: string | null
  items: MenuItem[]
}

type SelectedItem = MenuItem & { categoryName: string }

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

function categoryAnchor(id: string | number) {
  return `menu-cat-${id}`
}

export default function BranchMenuPage() {
  const { t, i18n } = useTranslation()
  const { branchId } = useParams()
  const ownerBranding = branchId ? getBranchOwnerBranding(branchId) : null
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [toastName, setToastName] = useState<string | null>(null)

  const { data: branches } = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: branchesQueryOptions.queryFn,
    ...branchesQueryOptions
  })

  const branch = branches?.find((b: { id: string }) => b.id === branchId)
  const branchName = branch ? branchDisplayName(branch.name) : ""

  const { data, isError: menuError, refetch: refetchMenu, isFetching: menuFetching } = useQuery({
    queryKey: ["branchMenu", branchId, i18n.language],
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId,
    ...menuQueryOptions
  })

  const { data: bestsellersData } = useQuery({
    queryKey: ["branchBestsellers", branchId, i18n.language],
    queryFn: () => getBranchBestsellers(branchId!),
    enabled: !!branchId,
    ...bestsellersQueryOptions
  })

  const categories = (data?.categories ?? []) as MenuCategory[]

  const bestSellers = useMemo(
    () => pickFeatured(categories, 6, { salesItemIds: bestsellersData?.itemIds }),
    [categories, bestsellersData?.itemIds]
  )

  const totalItems = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  )

  useEffect(() => {
    if (!toastName) return
    const timer = window.setTimeout(() => setToastName(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toastName])

  const openItem = (item: MenuItem, categoryName: string) => {
    setSelectedItem({ ...item, categoryName })
  }

  const renderItemCard = (item: MenuItem, categoryName: string) => {
    const image = dishImageForName(item.name, item.imageUrl, categoryName)
    return (
      <article key={item.id} className="branch-menu__card">
        <button
          type="button"
          className="branch-menu__card-main"
          onClick={() => openItem(item, categoryName)}
        >
          <div className="branch-menu__thumb" aria-hidden="true">
            <img src={image} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="branch-menu__card-body">
            <div className="branch-menu__card-top">
              {item.itemNumber && (
                <span className="branch-menu__number">Nr. {item.itemNumber}</span>
              )}
              <h4 className="branch-menu__name">{item.name}</h4>
            </div>
            {item.description && (
              <p className="branch-menu__desc">{item.description}</p>
            )}
            <p className="branch-menu__price">
              {t("menu.from")} {formatCurrency(item.price)}
            </p>
          </div>
        </button>
        <button
          type="button"
          className="branch-menu__order-btn"
          onClick={() => openItem(item, categoryName)}
        >
          {t("home.orderNow")}
        </button>
      </article>
    )
  }

  if (!data?.categories) {
    if (menuError) {
      return (
        <div className="customer-page">
          <p className="customer-hint" style={{ color: "#b45309" }}>
            {t("menu.loadError")}
          </p>
          <button type="button" className="customer-btn" onClick={() => void refetchMenu()}>
            {t("common.retry")}
          </button>
        </div>
      )
    }
    return <p className="customer-loading">{t("menu.loading")}</p>
  }

  return (
    <div className="customer-page customer-page--wide branch-menu">
      {ownerBranding && branchName && (
        <BranchOwnerWelcome branding={ownerBranding} branchName={branchName} />
      )}

      <header className="branch-menu__header">
        <p className="customer-eyebrow">{t("common.brand")}</p>
        <h2 className="customer-title">{t("menu.title")}</h2>
        <p className="branch-menu__meta">
          {categories.length} {t("menu.categories")} · {totalItems} {t("menu.dishes")}
        </p>
      </header>

      <nav className="branch-menu__nav" aria-label={t("menu.categories")}>
        {bestSellers.length > 0 && (
          <a
            className="branch-menu__nav-link branch-menu__nav-link--best"
            href={`#${categoryAnchor(BEST_SELLERS_SECTION_ID)}`}
          >
            {t("menu.bestSellers")}
            <span className="branch-menu__nav-count">{bestSellers.length}</span>
          </a>
        )}
        {categories.map((cat) => (
          <a key={cat.id} className="branch-menu__nav-link" href={`#${categoryAnchor(cat.id)}`}>
            {cat.name}
            <span className="branch-menu__nav-count">{cat.items.length}</span>
          </a>
        ))}
      </nav>

      {bestSellers.length > 0 && (
        <section
          id={categoryAnchor(BEST_SELLERS_SECTION_ID)}
          className="branch-menu__section branch-menu__section--best"
        >
          <div className="branch-menu__section-head">
            <h3 className="branch-menu__section-title">{t("menu.bestSellers")}</h3>
            <p className="branch-menu__section-desc">
              {bestsellersData?.hasSalesData
                ? t("menu.bestSellersFromSales")
                : t("menu.bestSellersDesc")}
            </p>
          </div>

          <div className="branch-menu__grid">
            {bestSellers.map((item) =>
              renderItemCard(item, categoryForItem(categories, item))
            )}
          </div>
        </section>
      )}

      {categories.map((cat) => (
        <section key={cat.id} id={categoryAnchor(cat.id)} className="branch-menu__section">
          <div className="branch-menu__section-head">
            <h3 className="branch-menu__section-title">{cat.name}</h3>
            {cat.description && (
              <p className="branch-menu__section-desc">{cat.description}</p>
            )}
          </div>

          <div className="branch-menu__grid">
            {cat.items.map((item) => renderItemCard(item, cat.name))}
          </div>
        </section>
      ))}

      {branchId && selectedItem && (
        <ItemOptionsModal
          open={!!selectedItem}
          branchId={branchId}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          itemNumber={selectedItem.itemNumber}
          categoryName={selectedItem.categoryName}
          imageUrl={selectedItem.imageUrl}
          onClose={() => setSelectedItem(null)}
          onAdded={(name) => setToastName(name)}
          onSuggestItem={(item) =>
            setSelectedItem({
              id: item.id,
              name: item.name,
              itemNumber: item.itemNumber,
              price: item.price,
              imageUrl: item.imageUrl,
              categoryName: categoryForItem(categories, item)
            })
          }
        />
      )}

      {toastName && (
        <div className="branch-menu__toast" role="status">
          <span>{t("item.addedToCart", { name: toastName })}</span>
          <Link to="/customer/cart" className="branch-menu__toast-link">
            {t("item.viewCart")}
          </Link>
        </div>
      )}
    </div>
  )
}
