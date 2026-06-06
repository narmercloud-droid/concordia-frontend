import React from "react"
import { useTranslation } from "react-i18next"

const ITEMS = [
  { key: "pizza", icon: "pizza" },
  { key: "pasta", icon: "pasta" },
  { key: "salads", icon: "salads" },
  { key: "alforno", icon: "alforno" },
  { key: "classics", icon: "classics" }
] as const

function ShowcaseIcon({ type }: { type: (typeof ITEMS)[number]["icon"] }) {
  if (type === "pizza") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 8v16l12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="30" cy="18" r="2" fill="currentColor" />
        <circle cx="20" cy="22" r="1.5" fill="currentColor" />
      </svg>
    )
  }
  if (type === "pasta") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M10 30c8-12 20-12 28 0M14 26c6-9 14-9 20 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="24" cy="34" rx="12" ry="4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    )
  }
  if (type === "salads") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <ellipse cx="24" cy="28" rx="14" ry="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 24c2-6 6-10 8-14M32 24c-2-6-6-10-8-14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === "alforno") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="12" y="16" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 34h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 22h8M20 26h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M14 32l8-16 8 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18 28h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="34" rx="10" ry="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export default function MenuShowcase() {
  const { t } = useTranslation()

  return (
    <section className="home-showcase">
      <p className="home-section-label">{t("home.showcaseLabel")}</p>
      <h2 className="home-section-title">{t("home.showcaseTitle")}</h2>
      <div className="home-showcase__grid">
        {ITEMS.map((item) => (
          <article key={item.key} className="home-showcase__card">
            <div className="home-showcase__icon">
              <ShowcaseIcon type={item.icon} />
            </div>
            <h3>{t(`home.showcase.${item.key}`)}</h3>
            <p>{t(`home.showcase.${item.key}Desc`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
