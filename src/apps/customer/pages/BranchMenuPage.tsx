import React, { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchMenu, getBranches } from "@/api/customer"
import BranchOwnerWelcome from "@/apps/customer/components/BranchOwnerWelcome"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import { getBranchOwnerBranding } from "@/lib/branchBranding"
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
  const { t } = useTranslation()
  const { branchId } = useParams()
  const ownerBranding = branchId ? getBranchOwnerBranding(branchId) : null
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [toastName, setToastName] = useState<string | null>(null)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const branch = branches?.find((b: { id: string }) => b.id === branchId)
  const branchName = branch ? branchDisplayName(branch.name) : ""

  const { data } = useQuery({
    queryKey: ["branchMenu", branchId],
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId
  })

  const categories = (data?.categories ?? []) as MenuCategory[]

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

  if (!data?.categories) {
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
        {categories.map((cat) => (
          <a key={cat.id} className="branch-menu__nav-link" href={`#${categoryAnchor(cat.id)}`}>
            {cat.name}
            <span className="branch-menu__nav-count">{cat.items.length}</span>
          </a>
        ))}
      </nav>

      {categories.map((cat) => (
        <section key={cat.id} id={categoryAnchor(cat.id)} className="branch-menu__section">
          <div className="branch-menu__section-head">
            <h3 className="branch-menu__section-title">{cat.name}</h3>
            {cat.description && (
              <p className="branch-menu__section-desc">{cat.description}</p>
            )}
          </div>

          <div className="branch-menu__grid">
            {cat.items.map((item) => {
              const image = dishImageForName(item.name, item.imageUrl, cat.name)
              return (
                <article key={item.id} className="branch-menu__card">
                  <button
                    type="button"
                    className="branch-menu__card-main"
                    onClick={() => openItem(item, cat.name)}
                  >
                    <div
                      className="branch-menu__thumb"
                      style={{ backgroundImage: `url(${image})` }}
                      aria-hidden="true"
                    />
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
                    onClick={() => openItem(item, cat.name)}
                  >
                    {t("home.orderNow")}
                  </button>
                </article>
              )
            })}
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
