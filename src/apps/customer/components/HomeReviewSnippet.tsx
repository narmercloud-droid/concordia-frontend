import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getKempenFeaturedReviews } from "@/lib/homeGoogleReviews"

function stars(rating: number) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return "★".repeat(full) + "☆".repeat(5 - full)
}

type Props = {
  compact?: boolean
}

export default function HomeReviewSnippet({ compact = false }: Props) {
  const { t } = useTranslation()
  const reviews = useMemo(() => getKempenFeaturedReviews(), [])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reviews.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [reviews.length])

  if (!reviews.length) return null

  const review = reviews[index]

  return (
    <figure
      className={`home-review-snippet${compact ? " home-review-snippet--compact" : ""}`}
      aria-live="polite"
    >
      <div className="home-review-snippet__meta">
        <span className="home-review-snippet__stars" aria-hidden>
          {stars(review.rating)}
        </span>
        <span className="home-review-snippet__label">{t("home.googleReview")}</span>
      </div>
      <blockquote className="home-review-snippet__quote">
        <p>&ldquo;{review.text}&rdquo;</p>
        <footer>
          — {review.author}
          {review.relativeTime ? ` · ${review.relativeTime}` : ""}
        </footer>
      </blockquote>
      <Link to="/reviews" className="home-review-snippet__link">
        {compact ? t("home.moreReviewsShort") : t("home.moreReviews")}
      </Link>
    </figure>
  )
}
