import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  loadFulfillmentIntent,
  parseFulfillmentParam,
  saveFulfillmentIntent,
  type FulfillmentIntent
} from "@/lib/fulfillmentIntent"
import FulfillmentPicker from "@/apps/customer/components/FulfillmentPicker"
import AllergenNotice from "@/apps/customer/components/AllergenNotice"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import CouponCampaignStrip from "@/apps/customer/components/CouponCampaignStrip"
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

function categoryAnchor(id: string | number) {
  return `menu-cat-${id}`
}

function getMenuStickyOffset(): number {
  const siteNav = document.querySelector(".customer-site-nav-wrap")
  const menuNav = document.querySelector(".branch-menu__nav-bar")
  const siteH = siteNav?.getBoundingClientRect().height ?? 0
  const menuH = menuNav?.getBoundingClientRect().height ?? 0
  const siteStuck = siteNav != null && siteNav.getBoundingClientRect().top <= 0
  const menuStuck =
    menuNav != null && menuNav.getBoundingClientRect().top <= (siteStuck ? siteH : 0)
  return (siteStuck ? siteH : 0) + (menuStuck ? menuH : 0) + 12
}

function scrollToMenuSection(id: string | number) {
  const section = document.getElementById(categoryAnchor(id))
  if (!section) return
  const top = section.getBoundingClientRect().top + window.scrollY - getMenuStickyOffset()
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
}

function centerActiveNavLink(navScroll: HTMLElement | null) {
  if (!navScroll) return
  const activeLink = navScroll.querySelector(".branch-menu__nav-link--active")
  if (!(activeLink instanceof HTMLElement)) return
  const target =
    activeLink.offsetLeft - navScroll.clientWidth / 2 + activeLink.offsetWidth / 2
  navScroll.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
}

type CategoryNavProps = {
  activeSectionId: string | number | null
  bestSellers: MenuItem[]
  categories: MenuCategory[]
  categoriesLabel: string
  bestSellersLabel: string
  navScrollRef: React.RefObject<HTMLDivElement | null>
  onCategorySelect: (id: string | number) => void
}

function BranchMenuCategoryNav({
  activeSectionId,
  bestSellers,
  categories,
  categoriesLabel,
  bestSellersLabel,
  navScrollRef,
  onCategorySelect
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
      <div className="branch-menu__nav-scroll" ref={navScrollRef}>
        {bestSellers.length > 0 && (
          <a
            className={linkClass(BEST_SELLERS_SECTION_ID, true)}
            href={`#${categoryAnchor(BEST_SELLERS_SECTION_ID)}`}
            onClick={(e) => {
              e.preventDefault()
              onCategorySelect(BEST_SELLERS_SECTION_ID)
            }}
          >
            <span className="branch-menu__nav-text">{bestSellersLabel}</span>
            <span className="branch-menu__nav-count">{bestSellers.length}</span>
          </a>
        )}
        {categories.map((cat) => (
          <a
            key={cat.id}
            className={linkClass(cat.id)}
            href={`#${categoryAnchor(cat.id)}`}
            onClick={(e) => {
              e.preventDefault()
              onCategorySelect(cat.id)
            }}
          >
            <span className="branch-menu__nav-text">{cat.name}</span>
            <span className="branch-menu__nav-count">{cat.items?.length ?? 0}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

function branchMenuEyebrow(branch?: { name?: string; city?: string | null }) {
  const location =
    branch?.name?.replace(/^Concordia\s+/i, "").trim() ||
    branch?.city?.trim() ||
    ""
  return location ? `Pizzeria Concordia - ${location}` : "Pizzeria Concordia"
}

function normalizeMenuSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

function itemMatchesMenuSearch(item: MenuItem, query: string) {
  if (!query) return true
  const haystack = normalizeMenuSearch(
    [item.itemNumber, item.name, item.description].filter(Boolean).join(" ")
  )
  return haystack.includes(query)
}

export default function BranchMenuPage() {
  const { t, i18n } = useTranslation()
  const { branchId } = useParams()
  const location = useLocation()
  const setSelectedBranchId = useBranchStore((s) => s.setSelectedBranchId)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [toastName, setToastName] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null)
  const [fulfillment, setFulfillment] = useState<FulfillmentIntent>("delivery")
  const [menuSearch, setMenuSearch] = useState("")
  const navScrollRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const programmaticScrollRef = useRef(false)
  const programmaticScrollTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!branchId) return
    const fromUrl = parseFulfillmentParam(
      new URLSearchParams(location.search).get("fulfillment")
    )
    const fromStored = loadFulfillmentIntent(branchId)
    const next = fromUrl ?? fromStored ?? "delivery"
    setFulfillment(next)
    if (fromUrl) saveFulfillmentIntent(branchId, fromUrl)
  }, [branchId, location.search])

  const handleFulfillmentChange = (next: FulfillmentIntent) => {
    setFulfillment(next)
    if (branchId) saveFulfillmentIntent(branchId, next)
  }

  const { data: branches, isSuccess: branchesReady } = useQuery({
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
  const searchQuery = useMemo(() => normalizeMenuSearch(menuSearch), [menuSearch])
  const isSearching = searchQuery.length > 0

  const bestSellers = useMemo(
    () => pickFeatured(categories, 6, { salesItemIds: bestsellersData?.itemIds }),
    [categories, bestsellersData?.itemIds]
  )

  const filteredBestSellers = useMemo(
    () =>
      isSearching
        ? bestSellers.filter((item) => itemMatchesMenuSearch(item, searchQuery))
        : bestSellers,
    [bestSellers, isSearching, searchQuery]
  )

  const filteredCategories = useMemo(() => {
    if (!isSearching) return categories
    return categories
      .map((cat) => ({
        ...cat,
        items: (cat.items ?? []).filter((item) => itemMatchesMenuSearch(item, searchQuery))
      }))
      .filter((cat) => (cat.items?.length ?? 0) > 0)
  }, [categories, isSearching, searchQuery])

  const searchResultCount = useMemo(() => {
    if (!isSearching) return 0
    const ids = new Set<number>()
    for (const item of filteredBestSellers) ids.add(item.id)
    for (const cat of filteredCategories) {
      for (const item of cat.items ?? []) ids.add(item.id)
    }
    return ids.size
  }, [filteredBestSellers, filteredCategories, isSearching])

  const sectionIds = useMemo(() => {
    const ids: Array<string | number> = []
    if (filteredBestSellers.length > 0) ids.push(BEST_SELLERS_SECTION_ID)
    for (const cat of filteredCategories) ids.push(cat.id)
    return ids
  }, [filteredBestSellers.length, filteredCategories])

  const handleCategorySelect = useCallback((id: string | number) => {
    setActiveSectionId(id)
    programmaticScrollRef.current = true
    if (programmaticScrollTimerRef.current != null) {
      window.clearTimeout(programmaticScrollTimerRef.current)
    }
    scrollToMenuSection(id)
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false
      programmaticScrollTimerRef.current = null
    }, 700)
  }, [])

  useEffect(() => {
    if (!sectionIds.length) return

    const updateActiveSection = () => {
      if (programmaticScrollRef.current) return

      const marker = getMenuStickyOffset()
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
      if (programmaticScrollTimerRef.current != null) {
        window.clearTimeout(programmaticScrollTimerRef.current)
      }
    }
  }, [sectionIds])

  useEffect(() => {
    if (activeSectionId == null) return
    centerActiveNavLink(navScrollRef.current)
  }, [activeSectionId])

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
  }, [
    branchId,
    filteredCategories,
    filteredBestSellers,
    orderingDisabled,
    menuHasItemOptions,
    i18n.language
  ])

  useEffect(() => {
    if (!isSearching || !sectionIds.length) return
    setActiveSectionId(sectionIds[0])
  }, [isSearching, searchQuery, sectionIds])

  useEffect(() => {
    if (!toastName) return
    const timer = window.setTimeout(() => setToastName(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toastName])

  useEffect(() => {
    if (branchId) setSelectedBranchId(branchId)
  }, [branchId, setSelectedBranchId])

  useEffect(() => {
    setMenuSearch("")
  }, [branchId])

  const openItem = useCallback(
    (item: MenuItem, categoryName: string) => {
      if (orderingDisabled) return
      setSelectedItem({ ...item, categoryName })
    },
    [orderingDisabled]
  )

  const branchNotFound = branchesReady && !!branchId && !branch

  if (!data?.categories?.length) {
    if (branchNotFound) {
      return (
        <div className="customer-page">
          <p className="customer-hint">{t("common.notFound")}</p>
          <Link to="/" className="customer-btn customer-btn--primary" style={{ marginTop: 16, display: "inline-block" }}>
            {t("cart.backToMenu")}
          </Link>
        </div>
      )
    }
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
        {!orderingDisabled && (
          <div className="branch-menu__fulfillment">
            <p className="customer-hint branch-menu__fulfillment-lead">{t("menu.fulfillmentLead")}</p>
            <FulfillmentPicker
              value={fulfillment}
              onChange={handleFulfillmentChange}
              supportsDelivery={branch?.supportsDelivery !== false}
              supportsPickup={branch?.supportsPickup !== false}
              compact
            />
          </div>
        )}
      </header>

      {!orderingDisabled && branchId ? (
        <CouponCampaignStrip
          branchId={branchId}
          branchName={branch?.name?.replace(/^Concordia\s+/i, "")}
          title={t("coupons.activeOffersTitle")}
          showViewAll={false}
          scroll
        />
      ) : null}

      <div className="branch-menu__nav-bar">
        <div className="branch-menu__search">
          <label className="branch-menu__search-label" htmlFor="branch-menu-search">
            <span className="branch-menu__search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M16.5 16.5L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="visually-hidden">{t("menu.searchLabel")}</span>
          </label>
          <input
            ref={searchInputRef}
            id="branch-menu-search"
            className="branch-menu__search-input"
            type="search"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder={t("menu.searchPlaceholder", {
              name: branch?.name ?? "Concordia"
            })}
            autoComplete="off"
            enterKeyHint="search"
          />
          {menuSearch.trim() && (
            <button
              type="button"
              className="branch-menu__search-clear"
              onClick={() => {
                setMenuSearch("")
                searchInputRef.current?.focus()
              }}
              aria-label={t("menu.searchClear")}
            >
              ×
            </button>
          )}
        </div>

        {(isSearching ? filteredCategories.length > 0 || filteredBestSellers.length > 0 : true) && (
          <BranchMenuCategoryNav
            activeSectionId={activeSectionId}
            bestSellers={isSearching ? filteredBestSellers : bestSellers}
            categories={isSearching ? filteredCategories : categories}
            categoriesLabel={t("menu.categories")}
            bestSellersLabel={t("menu.bestSellers")}
            navScrollRef={navScrollRef}
            onCategorySelect={handleCategorySelect}
          />
        )}

        {isSearching && (
          <p className="branch-menu__search-meta" role="status">
            {searchResultCount > 0
              ? t("menu.searchResults", { count: searchResultCount })
              : t("menu.searchEmpty")}
          </p>
        )}
      </div>

      <div className="branch-menu__content">
      {isSearching && searchResultCount === 0 ? (
        <div className="branch-menu__search-empty" role="status">
          <p className="customer-hint">{t("menu.searchEmptyHint")}</p>
          <button
            type="button"
            className="customer-btn"
            onClick={() => {
              setMenuSearch("")
              searchInputRef.current?.focus()
            }}
          >
            {t("menu.searchClear")}
          </button>
        </div>
      ) : (
        <>
      {filteredBestSellers.length > 0 && (
        <section
          id={categoryAnchor(BEST_SELLERS_SECTION_ID)}
          className="branch-menu__section branch-menu__section--best"
        >
          <div className="branch-menu__section-head">
            <h3 className="branch-menu__section-title">{t("menu.bestSellers")}</h3>
            {!isSearching && (
              <p className="branch-menu__section-desc">
                {bestsellersData?.hasSalesData
                  ? t("menu.bestSellersFromSales")
                  : t("menu.bestSellersDesc")}
              </p>
            )}
          </div>

          <div className="branch-menu__grid">
            {filteredBestSellers.map((item) => (
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

      {filteredCategories.map((cat) => (
        <section key={cat.id} id={categoryAnchor(cat.id)} className="branch-menu__section">
          <div className="branch-menu__section-head">
            <h3 className="branch-menu__section-title">{cat.name}</h3>
            {!isSearching && cat.description && (
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
        </>
      )}

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
        aria-label={
          orderingDisabled
            ? t("home.comingSoonLabel")
            : t("menu.quickAddAria", { name: item.name })
        }
      >
        {orderingDisabled ? t("home.comingSoonLabel") : <span aria-hidden="true">+</span>}
      </button>
    </article>
  )
})
