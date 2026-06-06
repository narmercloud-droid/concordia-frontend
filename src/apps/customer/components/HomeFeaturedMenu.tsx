import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { getBranchMenu } from "@/api/customer"
import { branchItemPath, branchPath, KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import { formatCurrency } from "@/utils/format"

type MenuItem = {
  id: number
  name: string
  price: number
  imageUrl?: string | null
}

type Props = {
  branchId?: string | null
}

function pickFeatured(items: MenuItem[], limit = 6) {
  const pizza = items.filter((i) => /pizza/i.test(i.name)).slice(0, 2)
  const pasta = items.filter((i) => /pasta|spaghetti|penne|tagliatelle|lasagne/i.test(i.name)).slice(0, 2)
  const rest = items.filter((i) => !pizza.includes(i) && !pasta.includes(i))
  return [...pizza, ...pasta, ...rest].slice(0, limit)
}

export default function HomeFeaturedMenu({ branchId }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeBranch = branchId ?? KEMPEN_BRANCH_ID

  const { data, isLoading } = useQuery({
    queryKey: ["branchMenu", activeBranch, "featured"],
    queryFn: () => getBranchMenu(activeBranch)
  })

  const featured = useMemo(() => {
    const flat: MenuItem[] =
      data?.categories?.flatMap(
        (cat: { items: MenuItem[] }) => cat.items?.filter((i) => i.price > 0) ?? []
      ) ?? []
    return pickFeatured(flat)
  }, [data])

  if (isLoading) return null
  if (!featured.length) return null

  return (
    <section className="home-featured">
      <p className="home-section-label">{t("home.featuredLabel")}</p>
      <h2 className="home-section-title">{t("home.featuredTitle")}</h2>
      <div className="home-featured__track">
        {featured.map((item) => (
          <article key={item.id} className="home-featured__card">
            <div
              className="home-featured__visual"
              style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
            >
              {!item.imageUrl && <span className="home-featured__glyph" aria-hidden="true" />}
            </div>
            <div className="home-featured__body">
              <h3>{item.name}</h3>
              <p className="home-featured__price">{formatCurrency(item.price)}</p>
              <button
                type="button"
                className="home-featured__btn"
                onClick={() => navigate(branchItemPath(activeBranch, item.id))}
              >
                {t("common.view")}
              </button>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="home-featured__menu-link"
        onClick={() => navigate(branchPath(activeBranch))}
      >
        {t("home.featuredCta")}
      </button>
    </section>
  )
}
