import React from "react"
import { useTranslation } from "react-i18next"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"

const ITEMS = [
  { key: "pizza", image: FOOD_IMAGES.pizzaMargherita },
  { key: "pasta", image: FOOD_IMAGES.pastaTomato },
  { key: "salads", image: FOOD_IMAGES.saladMixed },
  { key: "alforno", image: FOOD_IMAGES.alforno },
  { key: "classics", image: FOOD_IMAGES.schnitzel }
] as const

export default function MenuShowcase() {
  const { t } = useTranslation()

  return (
    <section className="home-showcase">
      <p className="home-section-label">{t("home.showcaseLabel")}</p>
      <h2 className="home-section-title">{t("home.showcaseTitle")}</h2>
      <div className="home-showcase__grid">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="home-showcase__card"
            onClick={scrollToBranchChoice}
          >
            <div
              className="home-showcase__photo"
              style={{ backgroundImage: `url(${item.image})` }}
              role="img"
              aria-label={t(`home.showcase.${item.key}`)}
            />
            <div className="home-showcase__body">
              <h3>{t(`home.showcase.${item.key}`)}</h3>
              <p>{t(`home.showcase.${item.key}Desc`)}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
