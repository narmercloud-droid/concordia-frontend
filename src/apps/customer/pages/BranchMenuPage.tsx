import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchBestsellers, getBranchMenu } from "@/api/customer"
import { bestsellersQueryOptions, menuQueryOptionsFor } from "@/lib/customerQueryOptions"
import { getMenuLang } from "@/lib/menuLang"
import { readMenuCache } from "@/lib/menuCache"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { useBranchStore } from "@/store/branchStore"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import {
  BEST_SELLERS_SECTION_ID,
  categoryForItem,
  pickFeatured
} from "@/lib/featuredMenu"
import { dishImageForName } from "@/lib/foodImagery"
import { prefetchItemDetails, prefetchItemDetailsBatch } from "@/lib/prefetchItemDetails"
import { isFatMenuItem } from "@/lib/menuItemFromMenu"
import { formatCurrency } from "@/utils/format"
import {
  parseFulfillmentParam,
  saveFulfillmentIntent
} from "@/lib/fulfillmentIntent"
import AllergenNotice from "@/apps/customer/components/AllergenNotice"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import "./BranchMenuPage.css"

type MenuItem = {
  id: number
  itemNumber?: string | null
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  variantGroups?: unknown[]
  addOnGroups?: unknown[]
  extraPricing?: { sizeBased?: boolean; hint?: string }
}

type MenuCategory = {
  id: string | number
  name: string
  description?: string | null
  items: MenuItem[]
}

type SelectedItem = MenuItem & { categoryName: string }

type CategoryNavProps = {
  activeSectionId: string | number | null
  bestSellers: MenuItem[]
  categories: MenuCategory[]
  categoriesLabel: string
  bestSellersLabel: string
}

function BranchMenuCategoryNav({
  activeSectionId,
  bestSellers,
  categories,
  categoriesLabel,
  bestSellersLabel
}: CategoryNavProps) {
  const linkClass = (id: string | number, isBest = false) => {
    const active = activeSectionId != null && String(activeSectionId) === String(id)
    return [
      "branch-menu__nav-link",
      isBest && "branch-menu__nav-link--best",
      active && "branch-menu__nav-link--active"
    ]
      .filter(Boolean)
      .join(" ")
  }

  return (
    <nav className="branch-menu__nav" aria-label={categoriesLabel}>
      <p className="branch-menu__sidebar-label">{categoriesLabel}</p>
      {bestSellers.length > 0 && (
        <a
          className={linkClass(BEST_SELLERS_SECTION_ID, true)}
          href={`#${categoryAnchor(BEST_SELLERS_SECTION_ID)}`}
        >
          <span className="branch-menu__nav-text">{bestSellersLabel}</span>
          <span className="branch-menu__nav-count">{bestSellers.length}</span>
        </a>
      )}
      {categories.map((cat) => (
        <a key={cat.id} className={linkClass(cat.id)} href={`#${categoryAnchor(cat.id)}`}>
          <span className="branch-menu__nav-text">{cat.name}</span>
          <span className="branch-menu__nav-count">{cat.items?.length ?? 0}</span>
        </a>
      ))}
    </nav>
  )
}

function categoryAnchor(id: string | number) {
  return `menu-cat-${id}`
}

function branchMenuEyebrow(branch?: { name?: string; city?: string | null }) {
  const location =
    branch?.name?.replace(/^Concordia\s+/i, "").trim() ||
    branch?.city?.trim() ||
    ""
  return location ? `Pizzeria Concordia - ${location}` : "Pizzeria Concordia"
}

export default function BranchMenuPage() {
  const { t, i18n } = useTranslation()
  const { branchId } = useParams()
  const location = useLocation()
  const setSelectedBranchId = useBranchStore((s) => s.setSelectedBranchId)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [toastName, setToastName] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null)

  useEffect(() => {
    const fulfillment = parseFulfillmentParam(
      new URLSearchParams(location.search).get("fulfillment")
    )
    if (branchId && fulfillment) {
      saveFulfillmentIntent(branchId, fulfillment)
    }
  }, [branchId, location.search])

  const { data: branches } = useQuery({
    ...branchesQueryOptions,
    queryKey: BRANCHES_QUERY_KEY
  })

  const branch = branches?.find(
    (b: { id: string; name?: string; city?: string; comingSoon?: boolean; isOpen?: boolean }) =>
      b.id === branchId
  )
  const orderingDisabled = !!branch?.comingSoon
  const branchClosed = branch != null && !branch.comingSoon && branch.isOpen === false

  const menuLang = getMenuLang()
  const queryClient = useQueryClient()
  const menuQueryKey = ["branchMenu", branchId, menuLang] as const

  const menuOpts = menuQueryOptionsFor(branchId ?? "", menuLang)
  const {
    data,
    isError: menuError,
    isFetching: menuFetching,
    isPending: menuPending,
    refetch: refetchMenu
  } = useQuery({
    ...menuOpts,
    queryKey: menuQueryKey,
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId
  })

  useEffect(() => {
    if (!branchId || data?.categories?.length) return
    const cached = readMenuCache(branchId, menuLang)
    if (cached?.categories?.length) {
      queryClient.setQueryData(menuQueryKey, cached)
    }
  }, [branchId, menuLang, data?.categories?.length, queryClient, menuQueryKey])

  useEffect(() => {
    if (!menuError || !branchId || data?.categories?.length || menuFetching) return
    const timer = window.setTimeout(() => void refetchMenu(), 2000)
    return () => window.clearTimeout(timer)
  }, [menuError, branchId, data?.categories?.length, menuFetching, refetchMenu])

  const menuReady = !!data?.categories?.length

  const { data: bestsellersData } = useQuery({
    queryKey: ["branchBestsellers", branchId, menuLang],
    queryFn: () => getBranchBestsellers(branchId!),
    enabled: !!branchId && menuReady,
    ...bestsellersQueryOptions
  })

  const categories = (data?.categories ?? []) as MenuCategory[]

  const bestSellers = useMemo(
    () => pickFeatured(categories, 6, { salesItemIds: bestsellersData?.itemIds }),
    [categories, bestsellersData?.itemIds]
  )

  const sectionIds = useMemo(() => {
    const ids: Array<string | number> = []
    if (bestSellers.length > 0) ids.push(BEST_SELLERS_SECTION_ID)
    for (const cat of categories) ids.push(cat.id)
    return ids
  }, [bestSellers.length, categories])

  useEffect(() => {
    if (!sectionIds.length) return

    const updateActiveSection = () => {
      const marker = window.innerWidth < 720 ? 96 : 80
      let current = sectionIds[0]

      for (const id of sectionIds) {
        const section = document.getElementById(categoryAnchor(id))
        if (!section) continue
        if (section.getBoundingClientRect().top <= marker) {
          current = id
        }
      }

      setActiveSectionId((prev) => (String(prev) === String(current) ? prev : current))
    }

    updateActiveSection()
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection, { passive: true })
    return () => {
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
    }
  }, [sectionIds])

  useEffect(() => {
    if (activeSectionId != null || !sectionIds.length) return
    setActiveSectionId(sectionIds[0])
  }, [activeSectionId, sectionIds])

  const menuHasItemOptions = useMemo(
    () => categories.some((cat) => (cat.items ?? []).some((item) => isFatMenuItem(item))),
    [categories]
  )

  useEffect(() => {
    if (!branchId || !menuReady || orderingDisabled || menuHasItemOptions) return
    prefetchItemDetailsBatch(
      branchId,
      bestSellers.map((item) => item.id),
      i18n.language,
      6
    )
  }, [branchId, menuReady, orderingDisabled, menuHasItemOptions, bestSellers, i18n.language])

  useEffect(() => {
    if (!branchId || orderingDisabled || menuHasItemOptions) return
    const cards = document.querySelectorAll("[data-prefetch-item]")
    if (!cards.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = Number(entry.target.getAttribute("data-prefetch-item"))
          if (Number.isFinite(id)) prefetchItemDetails(branchId, id, i18n.language)
        }
      },
      { rootMargin: "160px 0px", threshold: 0.01 }
    )
    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [branchId, categories, orderingDisabled, menuHasItemOptions, i18n.language])

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
    const showMenuError = menuError && !menuFetching && !menuPending
    if (showMenuError) {
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
        <p className="customer-eyebrow branch-menu__eyebrow">{branchMenuEyebrow(branch)}</p>
        <h2 className="customer-title">{t("menu.title")}</h2>
      </header>

      <div className="branch-menu__body">
        <aside className="branch-menu__sidebar" aria-label={t("menu.categories")}>
          <BranchMenuCategoryNav
            activeSectionId={activeSectionId}
            bestSellers={bestSellers}
            categories={categories}
            categoriesLabel={t("menu.categories")}
            bestSellersLabel={t("menu.bestSellers")}
          />
        </aside>

        <div className="branch-menu__content">
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
            {(cat.items ?? []).map((item) => (
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

          </div>
      </div>

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
          menuItem={selectedItem}
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

      <AllergenNotice />
      <CheckoutLegalFooter />
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
    if (orderingDisabled || isFatMenuItem(item)) return
    prefetchItemDetails(branchId, item.id, i18n.language)
  }

  return (
    <article className="branch-menu__card" data-prefetch-item={item.id}>
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
            {t("menu.from")} {formatCurrency(item.price)} · {t("legal.priceInclVatShort")}
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
