import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchBestsellers, getBranchMenu } from "@/api/customer"
import { bestsellersQueryOptions, menuQueryOptionsFor } from "@/lib/customerQueryOptions"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { useBranchStore } from "@/store/branchStore"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import CouponCampaignStrip from "@/apps/customer/components/CouponCampaignStrip"
import {
  BEST_SELLERS_SECTION_ID,
  categoryForItem,
  pickFeatured
} from "@/lib/featuredMenu"
import { dishImageForName } from "@/lib/foodImagery"
import { prefetchItemDetails } from "@/lib/prefetchItemDetails"
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

function categoryAnchor(id: string | number) {
  return `menu-cat-${id}`
}

export default function BranchMenuPage() {
  const { t, i18n } = useTranslation()
  const { branchId } = useParams()
  const setSelectedBranchId = useBranchStore((s) => s.setSelectedBranchId)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [toastName, setToastName] = useState<string | null>(null)

  const { data: branches } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branch = branches?.find(
    (b: { id: string; comingSoon?: boolean; isOpen?: boolean }) => b.id === branchId
  )
  const orderingDisabled = !!branch?.comingSoon
  const branchClosed = branch != null && !branch.comingSoon && branch.isOpen === false

  const menuOpts = menuQueryOptionsFor(branchId ?? "", i18n.language)
  const { data, isError: menuError, refetch: refetchMenu } = useQuery({
    ...menuOpts,
    queryKey: ["branchMenu", branchId, i18n.language],
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId
  })

  const menuReady = !!data?.categories?.length

  const { data: bestsellersData } = useQuery({
    queryKey: ["branchBestsellers", branchId, i18n.language],
    queryFn: () => getBranchBestsellers(branchId!),
    enabled: !!branchId && menuReady,
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

  useEffect(() => {
    if (branchId) setSelectedBranchId(branchId)
  }, [branchId, setSelectedBranchId])

  const openItem = useCallback(
    (item: MenuItem, categoryName: string) => {
      if (orderingDisabled) return
      setSelectedItem({ ...item, categoryName })
    },
    [orderingDisabled]
  )

  if (!data?.categories?.length) {
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
      {branchClosed && (
        <div className="branch-menu__soon-banner branch-menu__closed-banner" role="status">
          {t("menu.closedBanner")}
        </div>
      )}

      {orderingDisabled && (
        <div className="branch-menu__soon-banner" role="status">
          {t("home.comingSoonLabel")} — {t("pages.faq.items.q6.a")}
        </div>
      )}

      <header className="branch-menu__header">
        <p className="customer-eyebrow">{t("common.brand")}</p>
        <h2 className="customer-title">{t("menu.title")}</h2>
        <p className="branch-menu__meta">
          {categories.length} {t("menu.categories")} · {totalItems} {t("menu.dishes")}
        </p>
      </header>

      {branchId && !orderingDisabled && (
        <CouponCampaignStrip
          branchId={branchId}
          branchName={branch?.name?.replace(/^Concordia\s+/i, "")}
        />
      )}

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
            {bestSellers.map((item) => (
              <BranchMenuItemCard
                key={item.id}
                branchId={branchId!}
                item={item}
                categoryName={categoryForItem(categories, item)}
                onOpen={openItem}
                orderingDisabled={orderingDisabled}
              />
            ))}
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
            {cat.items.map((item) => (
              <BranchMenuItemCard
                key={item.id}
                branchId={branchId!}
                item={item}
                categoryName={cat.name}
                onOpen={openItem}
                orderingDisabled={orderingDisabled}
              />
            ))}
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
          description={selectedItem.description}
          imageUrl={selectedItem.imageUrl}
          onClose={() => setSelectedItem(null)}
          onAdded={(name) => setToastName(name)}
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

type BranchMenuItemCardProps = {
  branchId: string
  item: MenuItem
  categoryName: string
  onOpen: (item: MenuItem, categoryName: string) => void
  orderingDisabled?: boolean
}

const BranchMenuItemCard = React.memo(function BranchMenuItemCard({
  branchId,
  item,
  categoryName,
  onOpen,
  orderingDisabled = false
}: BranchMenuItemCardProps) {
  const { t, i18n } = useTranslation()
  const image = dishImageForName(item.name, item.imageUrl, categoryName, item.description)

  const warmItemOptions = () => {
    if (orderingDisabled) return
    prefetchItemDetails(branchId, item.id, i18n.language)
  }

  return (
    <article className="branch-menu__card">
      <button
        type="button"
        className="branch-menu__card-main"
        onClick={() => onOpen(item, categoryName)}
        onMouseEnter={warmItemOptions}
        onTouchStart={warmItemOptions}
        onFocus={warmItemOptions}
      >
        <div className="branch-menu__thumb" aria-hidden="true">
          <img src={image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="branch-menu__card-body">
          <div className="branch-menu__card-top">
            {item.itemNumber && <span className="branch-menu__number">Nr. {item.itemNumber}</span>}
            <h4 className="branch-menu__name">{item.name}</h4>
          </div>
          {item.description && <p className="branch-menu__desc">{item.description}</p>}
          <p className="branch-menu__price">
            {t("menu.from")} {formatCurrency(item.price)}
          </p>
        </div>
      </button>
      <button
        type="button"
        className={`branch-menu__order-btn${orderingDisabled ? " branch-menu__order-btn--disabled" : ""}`}
        onClick={() => onOpen(item, categoryName)}
        onMouseEnter={warmItemOptions}
        onTouchStart={warmItemOptions}
        onFocus={warmItemOptions}
        disabled={orderingDisabled}
      >
        {orderingDisabled ? t("home.comingSoonLabel") : t("home.orderNow")}
      </button>
    </article>
  )
})
