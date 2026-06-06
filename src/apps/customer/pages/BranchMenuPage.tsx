import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranchMenu } from "@/api/customer"
import { branchItemPath } from "@/lib/customerPaths"
import { formatCurrency } from "@/utils/format"

export default function BranchMenuPage() {
  const { t } = useTranslation()
  const { branchId } = useParams()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ["branchMenu", branchId],
    queryFn: () => getBranchMenu(branchId!),
    enabled: !!branchId
  })

  if (!data?.categories) {
    return <p className="customer-loading">{t("menu.loading")}</p>
  }

  return (
    <div className="customer-page customer-page--wide">
      <p className="customer-eyebrow">{t("common.brand")}</p>
      <h2 className="customer-title">{t("menu.title")}</h2>

      {data.categories.map((cat: { id: string; name: string; items: Array<{ id: number; name: string; price: number }> }) => (
        <section key={cat.id} className="menu-category">
          <h3 className="menu-category__title">{cat.name}</h3>

          {cat.items.map((item) => (
            <article key={item.id} className="menu-item">
              <div className="menu-item__info">
                <h4>{item.name}</h4>
                <p className="menu-item__price">{formatCurrency(item.price)}</p>
              </div>
              <button
                type="button"
                className="menu-item__btn"
                onClick={() => navigate(branchItemPath(branchId!, item.id))}
              >
                {t("common.view")}
              </button>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
